require "test_helper"

class ShopTest < ActiveSupport::TestCase
  setup do
    @shop = Shop.create!(
      name: "Cafe Test",
      slug: "cafe-test",
      currency: "MXN",
      timezone: "America/Mexico_City",
      slot_duration_minutes: 30,
      prep_time_buffer_minutes: 10,
      operating_hours: {
        "mon" => { "is_open" => true, "open" => "07:00", "close" => "09:00" },
        "tue" => { "is_open" => false },
        "wed" => { "is_open" => true, "open" => "08:00", "close" => "20:00" }
      }
    )
    Current.shop = @shop
  end

  teardown do
    Current.shop = nil
  end

  test "defaults operating_hours when blank" do
    shop = Shop.create!(name: "Default", slug: "default-test", currency: "MXN")
    assert shop.operating_hours.keys.include?("mon")
  end

  test "hours_for returns closed day" do
    tuesday = Date.parse("2026-10-13")
    assert_equal false, @shop.hours_for(tuesday)["is_open"]
  end

  test "open_at? respects timezone" do
    monday = Date.parse("2026-10-12")
    open_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(monday.year, monday.month, monday.day, 7, 0)
    end
    assert @shop.open_at?(open_time)

    closed_time = Time.use_zone("America/Mexico_City") do
      Time.zone.local(monday.year, monday.month, monday.day, 6, 30)
    end
    assert_not @shop.open_at?(closed_time)
  end

  test "generate_slots_for returns 30 minute slots" do
    monday = Date.parse("2026-10-12")
    slots = @shop.generate_slots_for(monday)
    assert_equal 4, slots.length
    assert_equal "07:00", slots.first[:start_time].in_time_zone("America/Mexico_City").strftime("%H:%M")
    assert_equal "07:30", slots.first[:end_time].in_time_zone("America/Mexico_City").strftime("%H:%M")
  end

  test "generate_slots_for returns empty on closed day" do
    tuesday = Date.parse("2026-10-13")
    assert_empty @shop.generate_slots_for(tuesday)
  end

  test "available_slots_for respects existing reservations" do
    wednesday = Date.parse("2026-10-14")
    slot = @shop.pickup_slots.create!(
      slot_date: wednesday,
      start_time: "08:00:00",
      end_time: "08:30:00",
      capacity: 2
    )

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

    slots = @shop.available_slots_for(wednesday)
    first_slot = slots.find { |s| s[:start_time] == "08:00" }
    assert_equal 2, first_slot[:capacity]
    assert_equal 1, first_slot[:reserved]
    assert_equal 1, first_slot[:available]
  end

  test "available slots use shop capacity before a slot row exists" do
    @shop.update!(slot_capacity: 6)
    wednesday = Date.parse("2026-10-14")
    slots = @shop.available_slots_for(wednesday)
    assert slots.all? { |slot| slot[:capacity] == 6 }
  end

  test "rejects an open day that closes before it opens" do
    @shop.operating_hours = {
      "mon" => { "is_open" => true, "open" => "18:00", "close" => "08:00" }
    }

    assert_not @shop.valid?
    assert_includes @shop.errors.full_messages.join(" "), "hours_invalid"
  end

  test "accepts a closed day without opening times" do
    @shop.operating_hours = { "tue" => { "is_open" => false } }

    assert @shop.valid?
  end
end
