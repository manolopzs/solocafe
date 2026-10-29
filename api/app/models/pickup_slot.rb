class PickupSlot < ApplicationRecord
  class CapacityExceeded < StandardError; end

  include TenantScoped

  has_many :slot_reservations, foreign_key: :slot_id, dependent: :destroy
  has_many :orders, foreign_key: :pickup_slot_id, dependent: :nullify

  validates :slot_date, presence: true
  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :capacity, numericality: { greater_than_or_equal_to: 0 }

  def self.reserve_for!(shop:, slot_date:, start_time:, end_time:, order:, pickup_time:)
    Time.use_zone(shop.timezone) do
      normalized_start = coerce_time(slot_date, start_time)
      normalized_end = coerce_time(slot_date, end_time)

      shop.with_lock do
        slot = shop.pickup_slots.find_by(slot_date: slot_date, start_time: normalized_start)
        slot ||= shop.pickup_slots.create!(
          slot_date: slot_date,
          start_time: normalized_start,
          end_time: normalized_end,
          capacity: shop.slot_capacity
        )

        raise CapacityExceeded if slot.slot_reservations.count >= slot.capacity

        slot.slot_reservations.create!(order: order)
        order.update!(pickup_slot: slot, pickup_time: pickup_time)
        slot
      end
    end
  end

  def self.coerce_time(slot_date, value)
    return value if value.is_a?(Time) || value.is_a?(ActiveSupport::TimeWithZone)

    hour, minute, second = time_string(value).split(":").map(&:to_i)
    Time.zone.local(slot_date.year, slot_date.month, slot_date.day, hour, minute, second)
  end

  def self.time_string(value)
    return value.strftime("%H:%M:%S") if value.respond_to?(:strftime)

    text = value.to_s
    text.length == 5 ? "#{text}:00" : text
  end
  private_class_method :time_string
end
