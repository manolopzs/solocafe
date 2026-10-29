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
    tuesday = upcoming_tuesday
    get "/public/shops/#{@shop.id}/pickup_slots?date=#{tuesday}"
    assert_response :success

    slots = response.parsed_body["slots"]
    assert_equal 4, slots.length
    assert_equal "07:00", slots.first["start_time"]
    assert slots.first.key?("available")
  end

  test "scheduled order reserves a slot" do
    tuesday = upcoming_tuesday
    pickup_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(tuesday.year, tuesday.month, tuesday.day, 7, 0)
    end

    assert_difference -> { SlotReservation.count }, 1 do
      post shop_orders_url(@shop), params: order_params(pickup_time)
    end

    assert_response :created
    order = response.parsed_body["order"]
    assert_equal "scheduled", order["pickup_type"]
    assert_equal "pending_payment", order["status"]
    assert_not_nil order["pickup_slot"]
    assert_equal @shop.slot_capacity, order["pickup_slot"]["capacity"]
  end

  test "auto created slot uses the shop capacity" do
    @shop.update!(slot_capacity: 4)
    tuesday = upcoming_tuesday
    pickup_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(tuesday.year, tuesday.month, tuesday.day, 7, 30)
    end

    post shop_orders_url(@shop), params: order_params(pickup_time)
    assert_response :created

    Current.shop = @shop
    slot = PickupSlot.find(response.parsed_body.dig("order", "pickup_slot", "id"))
    assert_equal 4, slot.capacity
  end

  test "second order is rejected when the shop slot is full" do
    @shop.update!(slot_capacity: 1)
    tuesday = upcoming_tuesday
    pickup_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(tuesday.year, tuesday.month, tuesday.day, 8, 0)
    end

    post shop_orders_url(@shop), params: order_params(pickup_time)
    assert_response :created

    post shop_orders_url(@shop), params: order_params(pickup_time, phone: "5550000002")
    assert_response :unprocessable_entity
    assert_equal 1, SlotReservation.count
  end

  test "scheduled order fails outside operating hours" do
    tuesday = upcoming_tuesday
    pickup_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(tuesday.year, tuesday.month, tuesday.day, 6, 0)
    end

    post shop_orders_url(@shop), params: order_params(pickup_time)

    assert_response :unprocessable_entity
  end

  test "scheduled order fails when slot is full" do
    tuesday = upcoming_tuesday
    Current.shop = @shop
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

    post shop_orders_url(@shop), params: order_params(pickup_time)

    assert_response :unprocessable_entity
  end

  private

  def upcoming_tuesday
    date = Time.find_zone!("America/Mexico_City").today + 2
    date += 1 until date.tuesday?
    date
  end

  def order_params(pickup_time, phone: "5551234567")
    {
      order: {
        customer_name: "Juan",
        customer_phone: phone,
        pickup_type: "scheduled",
        pickup_slot_date: pickup_time.to_date.iso8601,
        pickup_slot_start_time: pickup_time.strftime("%H:%M"),
        items: [ { menu_item_id: @item.id, quantity: 1, modifier_option_ids: [] } ]
      }
    }
  end
end
