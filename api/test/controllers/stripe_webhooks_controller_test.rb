require "test_helper"
require "ostruct"

class StripeWebhooksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe A", slug: "cafe-a", currency: "MXN", stripe_account_id: "acct_123", owner: @owner)
    @order = Order.create!(
      shop: @shop,
      status: "received",
      payment_status: "pending",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )
    Payment.create!(order: @order, amount_cents: 1000, currency: "MXN", status: "pending", stripe_payment_intent_id: "pi_123")
  end

  test "payment_intent.succeeded updates payment and order" do
    event = build_event("payment_intent.succeeded", "pi_123", "ch_123")

    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    @order.reload
    assert_equal "succeeded", @order.payment_status
    assert_equal "succeeded", @order.payment.status
  end

  test "ignores irrelevant event types" do
    event = to_event({ "id" => "evt_2", "type" => "invoice.payment_succeeded", "data" => { "object" => {} } })

    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    @order.reload
    assert_equal "pending", @order.payment_status
  end

  test "rejects invalid signature" do
    error = Stripe::SignatureVerificationError.new("bad", "sig")

    with_stripe_webhook(->(*_args) { raise error }) do
      post webhooks_stripe_url, params: "{}", headers: { "Content-Type" => "application/json" }
    end

    assert_response :bad_request
  end

  private

  def build_event(type, payment_intent_id, charge_id)
    to_event({
      "id" => "evt_1",
      "type" => type,
      "data" => {
        "object" => {
          "id" => payment_intent_id,
          "metadata" => { "order_id" => @order.id },
          "latest_charge" => charge_id
        }
      }
    })
  end

  def to_event(hash)
    OpenStruct.new(hash.transform_values { |v| v.is_a?(Hash) ? OpenStruct.new(v.transform_values { |vv| vv.is_a?(Hash) ? OpenStruct.new(vv) : vv }) : v })
  end

  def with_stripe_webhook(return_value)
    original = Stripe::Webhook.method(:construct_event)
    Stripe::Webhook.define_singleton_method(:construct_event) do |*args|
      return_value.respond_to?(:call) ? return_value.call(*args) : return_value
    end
    yield
  ensure
    Stripe::Webhook.define_singleton_method(:construct_event, original)
  end
end
