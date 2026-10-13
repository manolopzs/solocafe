require "test_helper"

class Public::PickupSlotsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner@example.com", password: "password123")
    @shop = Shop.create!(
      name: "Cafe A",
      slug: "cafe-a",
      currency: "MXN",
      timezone: "America/Mexico_City",
      slot_duration_minutes: 30,
      operating_hours: {
        "tue" => { "is_open" => true, "open" => "07:00", "close" => "09:00" }
      }
    )
    ShopMember.create!(shop: @shop, user: @owner, role: :owner)

    @category = MenuCategory.create!(shop: @shop, name: "Bebidas", sort_order: 1)
    @item = MenuItem.create!(
      shop: @shop,
      category: @category,
      name: "Cappuccino",
      price_cents: 5500,
      is_active: true,
      is_86ed: false
    )
  end

  test "returns available slots for a date" do
    tuesday = Date.parse("2026-10-13")
    get "/public/shops/#{@shop.id}/pickup_slots?date=#{tuesday}"
    assert_response :success

    slots = response.parsed_body["slots"]
    assert_equal 4, slots.length
    assert_equal "07:00", slots.first["start_time"]
    assert slots.first.key?("available")
  end

  test "scheduled order reserves a slot" do
    tuesday = Date.parse("2026-10-13")
    pickup_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(tuesday.year, tuesday.month, tuesday.day, 7, 0)
    end

    assert_difference -> { SlotReservation.count }, 1 do
      post shop_orders_url(@shop), params: {
        order: {
          customer_name: "Juan",
          customer_phone: "5551234567",
          pickup_type: "scheduled",
          pickup_time: pickup_time.iso8601,
          items: [ { menu_item_id: @item.id, quantity: 1, modifier_option_ids: [] } ]
        }
      }
    end

    assert_response :created
    order = response.parsed_body["order"]
    assert_equal "scheduled", order["pickup_type"]
    assert_not_nil order["pickup_slot"]
  end

  test "scheduled order fails outside operating hours" do
    tuesday = Date.parse("2026-10-13")
    pickup_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(tuesday.year, tuesday.month, tuesday.day, 6, 0)
    end

    post shop_orders_url(@shop), params: {
      order: {
        customer_name: "Juan",
        customer_phone: "5551234567",
        pickup_type: "scheduled",
        pickup_time: pickup_time.iso8601,
        items: [ { menu_item_id: @item.id, quantity: 1, modifier_option_ids: [] } ]
      }
    }

    assert_response :unprocessable_entity
  end

  test "scheduled order fails when slot is full" do
    tuesday = Date.parse("2026-10-13")
    slot = @shop.pickup_slots.create!(
      slot_date: tuesday,
      start_time: "07:00:00",
      end_time: "07:30:00",
      capacity: 1
    )

    1.upto(1) do
      order = Order.create!(
        shop: @shop,
        status: "received",
        payment_status: "pending",
        subtotal_cents: 1000,
        total_cents: 1000,
        currency: "MXN",
        pickup_type: "scheduled"
      )
      SlotReservation.create!(slot: slot, order: order)
    end

    pickup_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(tuesday.year, tuesday.month, tuesday.day, 7, 0)
    end

    post shop_orders_url(@shop), params: {
      order: {
        customer_name: "Juan",
        customer_phone: "5551234567",
        pickup_type: "scheduled",
        pickup_time: pickup_time.iso8601,
        items: [ { menu_item_id: @item.id, quantity: 1, modifier_option_ids: [] } ]
      }
    }

    assert_response :unprocessable_entity
  end
end
