class StripeWebhooksController < ApplicationController
  class PaymentNotReady < StandardError; end

  def create
    payload = request.body.read
    sig_header = request.headers["Stripe-Signature"]

    event = Stripe::Webhook.construct_event(
      payload,
      sig_header,
      ENV.fetch("STRIPE_WEBHOOK_SECRET")
    )

    if StripeWebhookEvent.exists?(stripe_event_id: event.id)
      render json: { received: true }
      return
    end

    ActiveRecord::Base.transaction(requires_new: true) do
      process_event(event)
    end

    render json: { received: true }
  rescue Stripe::SignatureVerificationError => e
    PaymentLog.error("stripe.webhook.signature_failed", error_class: e.class.name)
    render json: { error: "invalid signature" }, status: :bad_request
  rescue PaymentNotReady
    render json: { error: "payment_not_ready" }, status: :conflict
  rescue Stripe::StripeError => e
    PaymentLog.error(
      "stripe.webhook.stripe_error",
      error_class: e.class.name,
      stripe_code: e.respond_to?(:code) ? e.code : nil
    )
    render json: { error: e.message }, status: :bad_gateway
  rescue ActiveRecord::RecordNotUnique
    render json: { received: true }
  rescue ActiveRecord::RecordInvalid => e
    raise unless e.record.is_a?(StripeWebhookEvent)

    render json: { received: true }
  end

  private

  def process_event(event)
    case event.type
    when "payment_intent.succeeded"
      handle_payment_intent_succeeded(event)
    when "payment_intent.payment_failed"
      handle_payment_failure(event, terminal: false)
    when "payment_intent.canceled"
      handle_payment_failure(event, terminal: true)
    when "charge.refunded"
      handle_charge_refunded(event)
    when "account.updated"
      handle_account_updated(event)
    when "payment_method.attached"
      handle_payment_method_attached(event)
    when "payment_method.detached"
      handle_payment_method_detached(event)
    when "payment_method.updated", "payment_method.automatically_updated"
      handle_payment_method_updated(event)
    else
      record_event!(event)
    end
  end

  def handle_payment_intent_succeeded(event)
    payment_intent = event.data.object
    payment = lock_payment(stripe_id(payment_intent))
    require_payment!(payment, event)
    order = lock_order(payment)

    if foreign_connect_account?(event, order, payment)
      record_event!(event)
      log_tenant_mismatch(event, order, payment)
      return
    end

    warn_metadata_shop_mismatch(payment_intent, order)

    if payment.status_refunded? || order.payment_status_refunded?
      record_event!(event)
      in_order_shop(order) { order.apply_refund! }
      return
    end

    if order.status_cancelled?
      record_event!(event)
      PaymentLog.error(
        "payment.success_after_cancel",
        order_id: order.id,
        shop_id: order.shop_id,
        payment_intent_id: stripe_id(payment_intent)
      )
      return
    end

    unless StripeCharges.matches_order?(payment_intent, order)
      record_event!(event)
      return
    end

    record_event!(event)
    in_order_shop(order) do
      charge_id = stripe_id(StripePayload.read(payment_intent, :latest_charge))
      attributes = { status: "succeeded" }
      attributes[:stripe_charge_id] = charge_id if charge_id.present?
      payment.update!(attributes)
      order.apply_successful_payment!
      create_event(order, event.type, payment_intent)
      save_card_from_payment_intent!(payment_intent)
    end
  end

  def handle_payment_failure(event, terminal:)
    payment_intent = event.data.object
    payment = lock_payment(stripe_id(payment_intent))
    require_payment!(payment, event)
    order = lock_order(payment)

    if foreign_connect_account?(event, order, payment)
      record_event!(event)
      log_tenant_mismatch(event, order, payment)
      return
    end

    record_event!(event)
    return if payment.status_succeeded? || payment.status_refunded?
    return if order.payment_status_succeeded? || order.payment_status_refunded?

    stripe_status = StripePayload.read(payment_intent, :status).to_s
    terminal_failure = terminal || stripe_status == "canceled"
    in_order_shop(order) do
      payment.update!(status: "failed")
      order.apply_failed_payment! if terminal_failure
      create_event(order, event.type, payment_intent)
      PaymentLog.warn(
        "payment.attempt_failed",
        order_id: order.id,
        shop_id: order.shop_id,
        payment_intent_id: stripe_id(payment_intent),
        stripe_status: stripe_status.presence,
        terminal: terminal_failure,
        stripe_code: StripePayload.read(StripePayload.read(payment_intent, :last_payment_error), :code)
      )
    end
  end

  def handle_payment_method_attached(event)
    record_event!(event)
    TenantScoped.unscoped_for_system { CustomerPaymentMethod.store_attached!(event.data.object) }
  end

  def handle_payment_method_detached(event)
    record_event!(event)
    TenantScoped.unscoped_for_system do
      payment_method_id = stripe_id(event.data.object)
      CustomerPaymentMethod.find_by(stripe_payment_method_id: payment_method_id)&.destroy!
    end
  end

  def handle_payment_method_updated(event)
    record_event!(event)
    TenantScoped.unscoped_for_system { CustomerPaymentMethod.apply_card_update!(event.data.object) }
  end

  def save_card_from_payment_intent!(payment_intent)
    return unless StripePayload.read(payment_intent, :metadata).then { |metadata| StripePayload.read(metadata, :save_card) } == "true"

    TenantScoped.unscoped_for_system do
      customer = Customer.find_by(id: StripePayload.read(StripePayload.read(payment_intent, :metadata), :customer_id))
      next if customer.nil?

      payment_method_id = stripe_id(StripePayload.read(payment_intent, :payment_method))
      next if payment_method_id.blank?

      stripe_payment_method = Stripe::PaymentMethod.retrieve(payment_method_id)
      CustomerPaymentMethod.store_for_customer!(customer, stripe_payment_method)
    end
  end

  def handle_charge_refunded(event)
    charge = event.data.object
    payment = payment_for_refund(charge)
    require_payment!(payment, event)
    order = lock_order(payment)

    if foreign_connect_account?(event, order, payment)
      record_event!(event)
      log_tenant_mismatch(event, order, payment)
      return
    end

    record_event!(event)
    unless full_refund?(charge, payment)
      PaymentLog.warn(
        "payment.partial_refund_ignored",
        order_id: order.id,
        shop_id: order.shop_id,
        payment_intent_id: payment.stripe_payment_intent_id,
        amount_refunded: StripePayload.read(charge, :amount_refunded)
      )
      return
    end

    in_order_shop(order) do
      charge_id = stripe_id(charge)
      payment.update!(status: "refunded", stripe_charge_id: charge_id.presence || payment.stripe_charge_id)
      order.apply_refund!
      create_event(order, event.type, charge)
    end
  end

  def payment_for_refund(charge)
    intent_id = stripe_id(StripePayload.read(charge, :payment_intent))
    charge_id = stripe_id(charge)
    if intent_id.present?
      payment = Payment.lock.find_by(stripe_payment_intent_id: intent_id)
      return payment if payment
    end

    Payment.lock.find_by(stripe_charge_id: charge_id) if charge_id.present?
  end

  def full_refund?(charge, payment)
    return false unless ActiveModel::Type::Boolean.new.cast(StripePayload.read(charge, :refunded))

    refunded_cents = StripePayload.read(charge, :amount_refunded)
    return true if refunded_cents.nil?

    refunded_cents.to_i >= payment.amount_cents.to_i
  end

  def lock_payment(payment_intent_id)
    return if payment_intent_id.blank?

    Payment.lock.find_by(stripe_payment_intent_id: payment_intent_id)
  end

  def lock_order(payment)
    TenantScoped.unscoped_for_system { Order.lock.find(payment.order_id) }
  end

  def require_payment!(payment, event)
    return payment if payment

    PaymentLog.warn(
      "stripe.webhook.payment_not_ready",
      stripe_event_id: event.id,
      event_type: event.type
    )
    raise PaymentNotReady
  end

  def foreign_connect_account?(event, order, payment)
    account = StripePayload.read(event, :account)
    return false if account.blank?

    allowed = [ payment.stripe_account_id, order.shop.stripe_account_id ].compact
    !allowed.include?(account)
  end

  def log_tenant_mismatch(event, order, payment)
    PaymentLog.error(
      "payment.tenant_mismatch",
      stripe_event_id: event.id,
      event_type: event.type,
      order_id: order.id,
      shop_id: order.shop_id,
      payment_intent_id: payment.stripe_payment_intent_id,
      stripe_account: StripePayload.read(event, :account)
    )
  end

  def warn_metadata_shop_mismatch(payment_intent, order)
    metadata_shop_id = StripePayload.read(StripePayload.read(payment_intent, :metadata), :shop_id)
    return if metadata_shop_id.blank? || metadata_shop_id == order.shop_id

    PaymentLog.warn(
      "payment.metadata_shop_mismatch",
      order_id: order.id,
      shop_id: order.shop_id,
      metadata_shop_id: metadata_shop_id,
      payment_intent_id: stripe_id(payment_intent)
    )
  end

  def record_event!(event)
    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
  end

  def stripe_id(value)
    StripeCharges.id_of(value)
  end

  def in_order_shop(order)
    previous_shop = Current.shop
    Current.shop = order.shop
    yield
  ensure
    Current.shop = previous_shop
  end

  def handle_account_updated(event)
    account = event.data.object
    shop = Shop.find_by(stripe_account_id: account.id)
    return unless shop

    record_event!(event)
    ShopOnboarding.apply_stripe_account!(shop, account)
  end

  def create_event(order, type, object)
    Event.create!(
      shop: order.shop,
      order: order,
      event_type: type,
      payload: object.as_json
    )
  end
end
