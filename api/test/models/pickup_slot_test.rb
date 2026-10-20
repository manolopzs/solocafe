require "test_helper"

class PickupSlotTest < ActiveSupport::TestCase
  self.use_transactional_tests = false

  setup do
    @suffix = SecureRandom.hex(4)
    @shop = Shop.create!(
      name: "Cafe #{@suffix}",
      slug: "cafe-#{@suffix}",
      currency: "MXN",
      timezone: "America/Mexico_City",
      slot_capacity: 1,
      slot_duration_minutes: 15
    )
    Current.shop = @shop
  end

  teardown do
    Current.shop = @shop
    SlotReservation.where(order_id: Order.where(shop: @shop).select(:id)).delete_all
    Order.where(shop: @shop).delete_all
    PickupSlot.where(shop: @shop).delete_all
    @shop.delete
    Current.shop = nil
  end

  test "only one reservation wins the last seat" do
    results = Queue.new
    slot_date = Date.current + 4
    threads = 2.times.map do |index|
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          Current.shop = @shop
          order = Order.create!(
            shop: @shop,
            status: "pending_payment",
            payment_status: "pending",
            subtotal_cents: 1000,
            total_cents: 1000,
            currency: "MXN",
            pickup_type: "scheduled",
            customer_phone: "555000000#{index}"
          )
          PickupSlot.reserve_for!(
            shop: @shop,
            slot_date: slot_date,
            start_time: "09:00:00",
            end_time: "09:15:00",
            order: order,
            pickup_time: Time.zone.parse("#{slot_date} 09:00")
          )
          results << :reserved
        rescue PickupSlot::CapacityExceeded
          results << :full
        rescue StandardError => error
          results << error
        end
      end
    end
    threads.each(&:join)

    outcomes = 2.times.map { results.pop }
    assert_equal [ :full, :reserved ], outcomes.sort_by(&:to_s)
    assert outcomes.none? { |outcome| outcome.is_a?(Exception) }
    assert_equal 1, SlotReservation.where(slot_id: PickupSlot.where(shop: @shop).select(:id)).count
    assert_equal [ @shop.slot_capacity ], PickupSlot.where(shop: @shop).pluck(:capacity)
  end
end
