require "test_helper"

class PickupEstimateTest < ActiveSupport::TestCase
  test "minutes use the items in the order and the current queue" do
    shop = Shop.create!(
      name: "Estimate Cafe",
      slug: "estimate-cafe",
      currency: "MXN",
      timezone: "America/Mexico_City",
      prep_time_buffer_minutes: 10
    )
    Current.shop = shop
    MenuItem.create!(shop: shop, name: "Galleta", price_cents: 2000, prep_time_min: 2, is_active: true, is_86ed: false)
    slow = MenuItem.create!(shop: shop, name: "Sandwich", price_cents: 8000, prep_time_min: 12, is_active: true, is_86ed: false)
    drink = MenuItem.create!(shop: shop, name: "Latte", price_cents: 5000, prep_time_min: 4, is_active: true, is_86ed: false)

    2.times do
      Order.create!(
        shop: shop,
        status: "received",
        payment_status: "succeeded",
        subtotal_cents: 1000,
        total_cents: 1000,
        currency: "MXN",
        pickup_type: "asap"
      )
    end

    order = Order.create!(
      shop: shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )
    order.order_items.create!(item: slow, item_name_snapshot: slow.name, unit_price_cents: 8000, quantity: 2, subtotal_cents: 16000)
    order.order_items.create!(item: drink, item_name_snapshot: drink.name, unit_price_cents: 5000, quantity: 1, subtotal_cents: 5000)

    minutes = PickupEstimate.minutes_for(
      shop: shop,
      lines: PickupEstimate.lines_for(order.reload),
      queue_count: PickupEstimate.queue_count(shop, exclude_order_id: order.id)
    )

    assert_equal 40, minutes
  ensure
    Current.shop = nil
  end

  test "an order already in the queue is not counted twice" do
    shop = Shop.create!(name: "Queue Cafe", slug: "queue-cafe", currency: "MXN", prep_time_buffer_minutes: 0)
    Current.shop = shop
    order = Order.create!(
      shop: shop,
      status: "preparing",
      payment_status: "succeeded",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )

    assert_equal 0, PickupEstimate.queue_count(shop, exclude_order_id: order.id)
    assert_equal 1, PickupEstimate.queue_count(shop)
  ensure
    Current.shop = nil
  end
end
