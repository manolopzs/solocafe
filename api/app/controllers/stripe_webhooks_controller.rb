class StripeWebhooksController < ApplicationController
  def create
    payload = request.body.read
    sig_header = request.headers["Stripe-Signature"]

    event = Stripe::Webhook.construct_event(
      payload,
      sig_header,
      ENV.fetch("STRIPE_WEBHOOK_SECRET")
    )

    case event.type
    when "payment_intent.succeeded"
      handle_payment_intent_succeeded(event.data.object)
    when "payment_intent.payment_failed"
      handle_payment_intent_payment_failed(event.data.object)
    end

    render json: { received: true }
  rescue Stripe::SignatureVerificationError => e
    render json: { error: e.message }, status: :bad_request
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :bad_gateway
  end

  private

  def handle_payment_intent_succeeded(payment_intent)
    payment = Payment.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment

    payment.update!(status: "succeeded")
    order = payment.order
    order.update!(payment_status: "succeeded")
    order.update!(status: "preparing") if order.can_transition_to?("preparing")

    create_event(order, "payment_intent.succeeded", payment_intent)
  end

  def handle_payment_intent_payment_failed(payment_intent)
    payment = Payment.find_by(stripe_payment_intent_id: payment_intent.id)
    return unless payment

    payment.update!(status: "failed")
    order = payment.order
    order.update!(payment_status: "failed")
    order.update!(status: "cancelled") if order.can_transition_to?("cancelled")

    create_event(order, "payment_intent.payment_failed", payment_intent)
  end

  def create_event(order, type, object)
    Event.create!(
      shop: order.shop,
      order: order,
      type: type,
      payload: object.as_json
    )
  end
end
