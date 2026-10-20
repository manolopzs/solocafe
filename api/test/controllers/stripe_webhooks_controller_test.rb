require "test_helper"
require "ostruct"

class StripeWebhooksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe A", slug: "cafe-a", currency: "MXN", stripe_account_id: "acct_123", owner: @owner)
    @order = Order.create!(
      shop: @shop,
      status: "pending_payment",
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
    assert_equal "received", @order.status
    assert_equal 1, StripeWebhookEvent.where(stripe_event_id: "evt_1").count
    assert_equal 1, Event.where(order: @order, event_type: "payment_intent.succeeded").count
  end

  test "duplicate payment success is idempotent and does not skip received" do
    event = build_event("payment_intent.succeeded", "pi_123", "ch_123")

    2.times do
      with_stripe_webhook(event) do
        post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
      end
      assert_response :success
    end

    @order.reload
    assert_equal "received", @order.status
    assert_equal 1, StripeWebhookEvent.where(stripe_event_id: "evt_1").count
    assert_equal 1, Event.where(order: @order, event_type: "payment_intent.succeeded").count
  end

  test "a later success event does not move a received order to preparing" do
    event = build_event("payment_intent.succeeded", "pi_123", "ch_123")
    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    second = build_event("payment_intent.succeeded", "pi_123", "ch_123", "evt_later")
    with_stripe_webhook(second) do
      post webhooks_stripe_url, params: second.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_equal "received", @order.reload.status
  end

  test "payment failure cancels an unpaid order and frees the slot" do
    slot = @shop.pickup_slots.create!(slot_date: Date.current + 3, start_time: "10:00:00", end_time: "10:15:00", capacity: 2)
    SlotReservation.create!(slot: slot, order: @order)

    event = build_event("payment_intent.payment_failed", "pi_123", nil, "evt_fail")
    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    @order.reload
    assert_equal "failed", @order.payment_status
    assert_equal "cancelled", @order.status
    assert_equal "failed", @order.payment.status
    assert_nil @order.slot_reservation
  end

  test "payment failure does not cancel an order that was already paid" do
    @order.update!(status: "received", payment_status: "succeeded")
    @order.payment.update!(status: "succeeded")

    event = build_event("payment_intent.payment_failed", "pi_123", nil, "evt_fail_paid")
    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    @order.reload
    assert_equal "received", @order.status
    assert_equal "succeeded", @order.payment_status
  end

  test "payment success does not change another tenants order" do
    other_shop = Shop.create!(name: "Cafe B", slug: "cafe-b", currency: "MXN", owner: @owner)
    other_order = Order.create!(
      shop: other_shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 2500,
      total_cents: 2500,
      currency: "MXN",
      pickup_type: "asap"
    )
    Payment.create!(order: other_order, amount_cents: 2500, currency: "MXN", status: "pending", stripe_payment_intent_id: "pi_other")

    event = build_event("payment_intent.succeeded", "pi_123", "ch_123")
    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    other_order.reload
    assert_equal "pending_payment", other_order.status
    assert_equal "pending", other_order.payment_status
    assert_equal "pending", other_order.payment.status
  end

  test "rolls back payment updates when the event record fails" do
    event = build_event("payment_intent.succeeded", "pi_123", "ch_123", "evt_atomic")
    original = nil
    original = Event.method(:create!)
    Event.define_singleton_method(:create!) { |*| raise "event write failed" }

    assert_raises(RuntimeError) do
      with_stripe_webhook(event) do
        post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
      end
    end

    @order.reload
    assert_equal "pending_payment", @order.status
    assert_equal "pending", @order.payment_status
    assert_equal "pending", @order.payment.status
    assert_equal 0, StripeWebhookEvent.where(stripe_event_id: "evt_atomic").count
  ensure
    Event.define_singleton_method(:create!, original) if original
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

  def build_event(type, payment_intent_id, charge_id, event_id = "evt_1")
    to_event({
      "id" => event_id,
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
