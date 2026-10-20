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
    Current.shop = @shop
    assert_equal 1, Event.where(order: @order, event_type: "payment_intent.succeeded").count
    assert_equal 1, Event.where(order: @order, event_type: "order.kitchen_new").count
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
    Current.shop = @shop
    assert_equal 1, Event.where(order: @order, event_type: "payment_intent.succeeded").count
    assert_equal 1, Event.where(order: @order, event_type: "order.kitchen_new").count
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
    Current.shop = @shop
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

  test "account.updated activates only the matching shop" do
    @shop.update!(stripe_connect_status: "pending")
    other = Shop.create!(
      name: "Cafe B",
      slug: "cafe-b-webhook",
      currency: "MXN",
      stripe_account_id: "acct_other",
      stripe_connect_status: "pending",
      owner: @owner
    )
    event = to_event({
      "id" => "evt_acct",
      "type" => "account.updated",
      "data" => {
        "object" => {
          "id" => "acct_123",
          "charges_enabled" => true,
          "details_submitted" => true
        }
      }
    })

    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    assert_equal "active", @shop.reload.stripe_connect_status
    assert_equal "pending", other.reload.stripe_connect_status
    assert_equal "pending_payment", @order.reload.status
    assert_equal 1, StripeWebhookEvent.where(stripe_event_id: "evt_acct").count
  end

  test "account.updated is idempotent" do
    @shop.update!(stripe_connect_status: "pending")
    event = to_event({
      "id" => "evt_acct_repeat",
      "type" => "account.updated",
      "data" => {
        "object" => {
          "id" => "acct_123",
          "charges_enabled" => false,
          "details_submitted" => true
        }
      }
    })

    2.times do
      with_stripe_webhook(event) do
        post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
      end
      assert_response :success
    end

    assert_equal "restricted", @shop.reload.stripe_connect_status
    assert_equal 1, StripeWebhookEvent.where(stripe_event_id: "evt_acct_repeat").count
  end

  test "payment success with save_card stores brand last4 and expiry" do
    Current.shop = nil
    customer = Customer.create!(name: "Ana", phone: "5551111111", stripe_customer_id: "cus_ana")
    @order.update!(customer: customer)
    event = build_saved_card_event(customer)

    with_stripe_webhook(event) do
      with_payment_method(card_payment_method) do
        post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
      end
    end

    assert_response :success
    saved = CustomerPaymentMethod.find_by(stripe_payment_method_id: "pm_saved")
    assert_equal customer.id, saved.customer_id
    assert_equal "visa", saved.brand
    assert_equal "4242", saved.last4
    assert_equal 12, saved.exp_month
    assert_equal 2030, saved.exp_year
    assert_not_includes CustomerPaymentMethod.column_names, "shop_id"
    assert_equal [ "pm_saved" ], @retrieved_payment_methods
    assert_equal "succeeded", @order.reload.payment_status
    assert_equal "received", @order.status
    Current.shop = @shop
    assert_equal 1, Event.where(order: @order, event_type: "order.kitchen_new").count
    assert_equal 0, CustomerPaymentMethod.where.not(customer_id: customer.id).count
  ensure
    Current.shop = nil
  end

  test "payment success without save_card does not store a card" do
    event = build_event("payment_intent.succeeded", "pi_123", "ch_123", "evt_nosave")

    with_stripe_webhook(event) do
      with_payment_method(card_payment_method) do
        post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
      end
    end

    assert_response :success
    assert_equal 0, CustomerPaymentMethod.count
    assert_empty @retrieved_payment_methods
  end

  test "payment_method.attached stores the card for the platform customer only" do
    Current.shop = nil
    customer = Customer.create!(name: "Ana", phone: "5551111111", stripe_customer_id: "cus_ana")
    other = Customer.create!(name: "Luis", phone: "5552222222", stripe_customer_id: "cus_luis")
    event = payment_method_event("payment_method.attached", "pm_attached", "cus_ana", "evt_attach")

    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    saved = CustomerPaymentMethod.find_by!(stripe_payment_method_id: "pm_attached")
    assert_equal customer.id, saved.customer_id
    assert_equal "visa", saved.brand
    assert_equal "4242", saved.last4
    assert_equal 0, CustomerPaymentMethod.where(customer: other).count
  end

  test "payment_method.attached ignores an unknown stripe customer" do
    event = payment_method_event("payment_method.attached", "pm_unknown", "cus_missing", "evt_unknown")

    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    assert_equal 0, CustomerPaymentMethod.count
    assert_equal 1, StripeWebhookEvent.where(stripe_event_id: "evt_unknown").count
  end

  test "payment_method.detached removes only that card" do
    Current.shop = nil
    customer = Customer.create!(name: "Ana", phone: "5551111111", stripe_customer_id: "cus_ana")
    other = Customer.create!(name: "Luis", phone: "5552222222", stripe_customer_id: "cus_luis")
    CustomerPaymentMethod.create!(customer: customer, stripe_payment_method_id: "pm_gone", brand: "visa", last4: "4242", exp_month: 12, exp_year: 2028)
    kept = CustomerPaymentMethod.create!(customer: other, stripe_payment_method_id: "pm_kept", brand: "mastercard", last4: "4444", exp_month: 1, exp_year: 2029)
    event = payment_method_event("payment_method.detached", "pm_gone", "cus_ana", "evt_detach")

    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    assert_nil CustomerPaymentMethod.find_by(stripe_payment_method_id: "pm_gone")
    assert CustomerPaymentMethod.exists?(kept.id)
  end

  test "payment_method.updated refreshes expiry without copying the card to another customer" do
    Current.shop = nil
    customer = Customer.create!(name: "Ana", phone: "5551111111", stripe_customer_id: "cus_ana")
    other = Customer.create!(name: "Luis", phone: "5552222222", stripe_customer_id: "cus_luis")
    saved = CustomerPaymentMethod.create!(customer: customer, stripe_payment_method_id: "pm_upd", brand: "visa", last4: "4242", exp_month: 1, exp_year: 2026)
    event = payment_method_event("payment_method.updated", "pm_upd", "cus_luis", "evt_upd", 8, 2031)

    with_stripe_webhook(event) do
      post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
    end

    assert_response :success
    saved.reload
    assert_equal customer.id, saved.customer_id
    assert_equal 8, saved.exp_month
    assert_equal 2031, saved.exp_year
    assert_equal 0, CustomerPaymentMethod.where(customer: other).count
  end

  test "payment success earns one stamp and a retry does not earn another" do
    customer = Customer.create!(name: "Ana", phone: "5551112222", user: User.create!(email: "stamp-webhook@example.com", password: "password123"))
    @order.update!(customer: customer)
    event = build_event("payment_intent.succeeded", "pi_123", "ch_123", "evt_stamp")

    2.times do
      with_stripe_webhook(event) do
        post webhooks_stripe_url, params: event.as_json.to_json, headers: { "Content-Type" => "application/json" }
      end
      assert_response :success
    end

    Current.shop = @shop
    assert_equal 1, LoyaltyStamp.where(customer: customer, order: @order, status: "earned").count
  end

  test "a full refund removes the stamp and a repeated refund stays removed" do
    customer = Customer.create!(name: "Ana", phone: "5551113333", user: User.create!(email: "refund-webhook@example.com", password: "password123"))
    @order.update!(customer: customer, status: "received", payment_status: "succeeded")
    @order.payment.update!(status: "succeeded")
    LoyaltyStamp.award_paid_order!(@order)
    other_shop = Shop.create!(name: "Cafe C", slug: "cafe-c-refund", currency: "MXN", owner: @owner)
    other = Order.create!(
      shop: other_shop,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 500,
      total_cents: 500,
      currency: "MXN",
      pickup_type: "asap"
    )
    event = refund_event("evt_refund")
    later = refund_event("evt_refund_later")

    [ event, later ].each do |payload|
      with_stripe_webhook(payload) do
        post webhooks_stripe_url, params: payload.as_json.to_json, headers: { "Content-Type" => "application/json" }
      end
      assert_response :success
    end

    @order.reload
    assert_equal "refunded", @order.payment_status
    assert_equal "refunded", @order.payment.status
    assert_equal "succeeded", other.reload.payment_status
    assert_equal "received", other.status
    Current.shop = @shop
    assert_equal 0, LoyaltyStamp.where(customer: customer, status: "earned").count
    assert_equal 1, LoyaltyStamp.where(customer: customer, status: "reversed").count
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

  def refund_event(event_id)
    to_event({
      "id" => event_id,
      "type" => "charge.refunded",
      "data" => {
        "object" => {
          "id" => "ch_123",
          "payment_intent" => "pi_123",
          "refunded" => true,
          "amount" => 1000,
          "amount_refunded" => 1000
        }
      }
    })
  end

  def build_saved_card_event(customer)
    to_event({
      "id" => "evt_save",
      "type" => "payment_intent.succeeded",
      "data" => {
        "object" => {
          "id" => "pi_123",
          "metadata" => {
            "order_id" => @order.id,
            "save_card" => "true",
            "customer_id" => customer.id
          },
          "payment_method" => "pm_saved",
          "latest_charge" => "ch_save"
        }
      }
    })
  end

  def payment_method_event(type, payment_method_id, customer_id, event_id, exp_month = 12, exp_year = 2030)
    to_event({
      "id" => event_id,
      "type" => type,
      "data" => {
        "object" => {
          "id" => payment_method_id,
          "customer" => customer_id,
          "type" => "card",
          "card" => {
            "brand" => "visa",
            "last4" => "4242",
            "exp_month" => exp_month,
            "exp_year" => exp_year
          }
        }
      }
    })
  end

  def card_payment_method
    OpenStruct.new(
      id: "pm_saved",
      type: "card",
      customer: "cus_ana",
      card: OpenStruct.new(brand: "visa", last4: "4242", exp_month: 12, exp_year: 2030)
    )
  end

  def with_payment_method(payment_method)
    @retrieved_payment_methods = []
    original = Stripe::PaymentMethod.method(:retrieve)
    retrieved = @retrieved_payment_methods
    Stripe::PaymentMethod.define_singleton_method(:retrieve) do |id, *|
      retrieved << id
      payment_method
    end
    yield
  ensure
    Stripe::PaymentMethod.define_singleton_method(:retrieve, original)
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
