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
    when "account.updated"
      handle_account_updated(event)
    else
      StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
    end
  end

  def handle_payment_intent_succeeded(event)
    payment_intent = event.data.object
    payment = Payment.lock.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment

    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)

    order = Order.unscoped.lock.find(payment.order_id)
    payment.update!(status: "succeeded")
    order.apply_successful_payment!
    create_event(order, event.type, payment_intent)
  end

  def handle_payment_intent_payment_failed(event)
    payment_intent = event.data.object
    payment = Payment.lock.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment

    StripeWebhookEvent.create!(stripe_event_id: event.id, event_type: event.type)
    return if payment.status_succeeded?

    order = Order.unscoped.lock.find(payment.order_id)
    return if order.payment_status_succeeded?

    payment.update!(status: "failed")
    order.apply_failed_payment!
    create_event(order, event.type, payment_intent)
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
