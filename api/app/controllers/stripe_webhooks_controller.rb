class StripeWebhooksController < ApplicationController
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
    render json: { error: e.message }, status: :bad_request
  rescue Stripe::StripeError => e
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
      handle_payment_intent_payment_failed(event)
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
      StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
    end
  end

  def handle_payment_intent_succeeded(event)
    payment_intent = event.data.object
    payment = Payment.lock.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment

    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)

    order = TenantScoped.unscoped_for_system { Order.lock.find(payment.order_id) }
    in_order_shop(order) do
      payment.update!(status: "succeeded")
      order.apply_successful_payment!
      create_event(order, event.type, payment_intent)
      save_card_from_payment_intent!(payment_intent)
    end
  end

  def handle_payment_method_attached(event)
    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
    TenantScoped.unscoped_for_system { CustomerPaymentMethod.store_attached!(event.data.object) }
  end

  def handle_payment_method_detached(event)
    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
    TenantScoped.unscoped_for_system do
      payment_method_id = StripePayload.read(event.data.object, :id)
      CustomerPaymentMethod.find_by(stripe_payment_method_id: payment_method_id)&.destroy!
    end
  end

  def handle_payment_method_updated(event)
    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
    TenantScoped.unscoped_for_system { CustomerPaymentMethod.apply_card_update!(event.data.object) }
  end

  def save_card_from_payment_intent!(payment_intent)
    return unless StripePayload.read(payment_intent, :metadata).then { |metadata| StripePayload.read(metadata, :save_card) } == "true"

    TenantScoped.unscoped_for_system do
      customer = Customer.find_by(id: StripePayload.read(StripePayload.read(payment_intent, :metadata), :customer_id))
      next if customer.nil?

      payment_method_ref = StripePayload.read(payment_intent, :payment_method)
      payment_method_id = payment_method_ref.is_a?(String) ? payment_method_ref : StripePayload.read(payment_method_ref, :id)
      next if payment_method_id.blank?

      stripe_payment_method = Stripe::PaymentMethod.retrieve(payment_method_id)
      CustomerPaymentMethod.store_for_customer!(customer, stripe_payment_method)
    end
  end

  def handle_charge_refunded(event)
    charge = event.data.object
    return unless ActiveModel::Type::Boolean.new.cast(StripePayload.read(charge, :refunded))

    payment = payment_for_refund(charge)
    return unless payment

    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
    order = TenantScoped.unscoped_for_system { Order.lock.find(payment.order_id) }
    in_order_shop(order) do
      charge_id = StripePayload.read(charge, :id)
      payment.update!(status: "refunded", stripe_charge_id: charge_id.presence || payment.stripe_charge_id)
      order.apply_refund!
      create_event(order, event.type, charge)
    end
  end

  def payment_for_refund(charge)
    intent_id = StripePayload.read(charge, :payment_intent)
    charge_id = StripePayload.read(charge, :id)
    if intent_id.present?
      payment = Payment.lock.find_by(stripe_payment_intent_id: intent_id)
      return payment if payment
    end

    Payment.lock.find_by(stripe_charge_id: charge_id) if charge_id.present?
  end

  def handle_payment_intent_payment_failed(event)
    payment_intent = event.data.object
    payment = Payment.lock.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment

    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
    return if payment.status_succeeded?

    order = TenantScoped.unscoped_for_system { Order.lock.find(payment.order_id) }
    return if order.payment_status_succeeded?

    in_order_shop(order) do
      payment.update!(status: "failed")
      order.apply_failed_payment!
      create_event(order, event.type, payment_intent)
    end
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

    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
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
