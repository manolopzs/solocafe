require "test_helper"

class OrderTest < ActiveSupport::TestCase
  test "pending payment comes before received" do
    order = Order.new(status: "pending_payment")

    assert order.can_transition_to?("received")
    assert order.can_transition_to?("cancelled")
    assert_not order.can_transition_to?("preparing")
    assert_not order.staff_can_transition_to?("received")
    assert order.staff_can_transition_to?("cancelled")
  end

  test "valid status transitions" do
    order = Order.new(status: "received")

    assert order.can_transition_to?("preparing")
    assert order.can_transition_to?("cancelled")
    assert_not order.can_transition_to?("ready")
    assert_not order.can_transition_to?("picked_up")
  end

  test "preparing to ready and cancelled" do
    order = Order.new(status: "preparing")

    assert order.can_transition_to?("ready")
    assert order.can_transition_to?("cancelled")
    assert_not order.can_transition_to?("received")
  end

  test "ready to picked up only" do
    order = Order.new(status: "ready")

    assert order.can_transition_to?("picked_up")
    assert_not order.can_transition_to?("preparing")
    assert_not order.can_transition_to?("cancelled")
  end

  test "successful payment enters the kitchen once" do
    owner = User.create!(email: "kitchen-owner@example.com", password: "password123")
    shop = Shop.create!(name: "Cafe Kitchen", slug: "cafe-kitchen", currency: "MXN", owner: owner)
    order = Order.create!(
      shop: shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )

    order.apply_successful_payment!
    assert_equal "received", order.status
    assert_equal "succeeded", order.payment_status
    assert_equal 1, kitchen_events(order)

    order.apply_successful_payment!
    assert_equal "received", order.reload.status
    assert_equal 1, kitchen_events(order)
  end

  test "kitchen arrival stays on the order shop when another shop is current" do
    owner = User.create!(email: "kitchen-other@example.com", password: "password123")
    shop = Shop.create!(name: "Cafe Kitchen 2", slug: "cafe-kitchen-2", currency: "MXN", owner: owner)
    other = Shop.create!(name: "Cafe Other", slug: "cafe-other-kitchen", currency: "MXN", owner: owner)
    order = Order.create!(
      shop: shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )
    Current.shop = other

    order.record_kitchen_arrival!

    assert_equal "pending_payment", order.status
    assert_equal shop.id, TenantScoped.unscoped_for_system {
      Event.find_by!(order: order, event_type: "order.kitchen_new").shop_id
    }
  ensure
    Current.shop = nil
  end

  def kitchen_events(order)
    TenantScoped.unscoped_for_system { Event.where(order: order, event_type: "order.kitchen_new").count }
  end

  test "terminal states cannot transition" do
    assert_not Order.new(status: "picked_up").can_transition_to?("received")
    assert_not Order.new(status: "cancelled").can_transition_to?("preparing")
  end
end
