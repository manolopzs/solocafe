require "test_helper"

class OrderTest < ActiveSupport::TestCase
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

  test "terminal states cannot transition" do
    assert_not Order.new(status: "picked_up").can_transition_to?("received")
    assert_not Order.new(status: "cancelled").can_transition_to?("preparing")
  end
end
