class Shop < ApplicationRecord
  belongs_to :owner, class_name: "User", optional: true
  has_many :shop_members, dependent: :destroy
  has_many :users, through: :shop_members
  has_one :shop_subscription, dependent: :destroy
  has_many :menu_categories, dependent: :destroy
  has_many :menu_items, dependent: :destroy
  has_many :item_modifier_links, through: :menu_items
  has_many :modifier_groups, dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :pickup_slots, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_many :customer_favorites, dependent: :destroy

  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/ }
  validates :name, presence: true
  validates :currency, inclusion: { in: %w[MXN EUR] }
  validates :locale, inclusion: { in: %w[es en] }
  validates :slot_duration_minutes, numericality: { greater_than_or_equal_to: 5 }
  validates :prep_time_buffer_minutes, numericality: { greater_than_or_equal_to: 0 }
  validates :max_days_ahead, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 30 }

  scope :active, -> { where(status: "active") }

  DEFAULT_HOURS = {
    "mon" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "tue" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "wed" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "thu" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "fri" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "sat" => { "is_open" => true, "open" => "08:00", "close" => "20:00" },
    "sun" => { "is_open" => true, "open" => "08:00", "close" => "18:00" }
  }.freeze

  def operating_hours
    super.presence || DEFAULT_HOURS
  end

  def hours_for(date)
    wday = date.strftime("%a").downcase
    operating_hours[wday] || { "is_open" => false }
  end

  def open_at?(datetime)
    date = datetime.to_date
    hours = hours_for(date)
    return false unless hours["is_open"]

    Time.use_zone(timezone) do
      open_time = Time.zone.parse(hours["open"].to_s)
      close_time = Time.zone.parse(hours["close"].to_s)
      shop_open = Time.zone.local(date.year, date.month, date.day, open_time.hour, open_time.min)
      shop_close = Time.zone.local(date.year, date.month, date.day, close_time.hour, close_time.min)
      datetime >= shop_open && datetime < shop_close
    end
  end

  def generate_slots_for(date)
    hours = hours_for(date)
    return [] unless hours["is_open"]

    Time.use_zone(timezone) do
      open_time = Time.zone.parse(hours["open"].to_s)
      close_time = Time.zone.parse(hours["close"].to_s)
      shop_open = Time.zone.local(date.year, date.month, date.day, open_time.hour, open_time.min)
      shop_close = Time.zone.local(date.year, date.month, date.day, close_time.hour, close_time.min)

      slots = []
      cursor = shop_open
      while cursor + slot_duration_minutes.minutes <= shop_close
        slots << {
          start_time: cursor,
          end_time: cursor + slot_duration_minutes.minutes
        }
        cursor += slot_duration_minutes.minutes
      end
      slots
    end
  end

  def available_slots_for(date)
    slots = generate_slots_for(date)
    return [] if slots.empty?

    existing_slots = pickup_slots.where(slot_date: date).index_by do |slot|
      slot.start_time.strftime("%H:%M")
    end

    reservations = SlotReservation.where(slot_id: existing_slots.values.map(&:id)).group(:slot_id).count

    Time.use_zone(timezone) do
      slots.map do |slot_range|
        time_key = slot_range[:start_time].in_time_zone.strftime("%H:%M")
        slot = existing_slots[time_key]
        reserved_count = slot ? (reservations[slot.id] || 0) : 0
        capacity = slot ? slot.capacity : 10

        {
          start_time: time_key,
          end_time: slot_range[:end_time].in_time_zone.strftime("%H:%M"),
          capacity: capacity,
          reserved: reserved_count,
          available: [ capacity - reserved_count, 0 ].max
        }
      end
    end
  end
end
