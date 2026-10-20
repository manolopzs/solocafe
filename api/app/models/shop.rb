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
  has_many :push_devices, dependent: :destroy
  has_many :customer_favorites, dependent: :destroy
  has_one_attached :hero_photo

  DISPLAY_FONTS = {
    "dm_sans" => "DM Sans",
    "fraunces" => "Fraunces",
    "literata" => "Literata",
    "newsreader" => "Newsreader",
    "libre_baskerville" => "Libre Baskerville"
  }.freeze
  HEX_COLOR = /\A#[0-9a-f]{6}\z/
  CREAM_CANVAS = "#fffbf7"
  WHITE = "#ffffff"
  MIN_CONTRAST_RATIO = 4.5
  HERO_MAX_BYTES = 5.megabytes

  validates :slug, presence: true, uniqueness: true, format: { with: /\A[a-z0-9-]+\z/ }
  validates :name, presence: true
  validates :currency, inclusion: { in: %w[MXN EUR] }
  validates :locale, inclusion: { in: %w[es en] }
  validates :slot_duration_minutes, numericality: { greater_than_or_equal_to: 5 }
  validates :slot_capacity, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 500 }
  validates :prep_time_buffer_minutes, numericality: { greater_than_or_equal_to: 0 }
  validates :max_days_ahead, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 30 }
  validate :operating_hours_are_usable
  validate :brand_color_is_usable
  validate :display_font_is_curated
  validate :acceptable_hero_photo

  before_validation :normalize_brand_color

  scope :active, -> { where(status: "active") }

  DAY_KEYS = %w[mon tue wed thu fri sat sun].freeze
  TIME_PATTERN = /\A(?:[01]\d|2[0-3]):[0-5]\d\z/

  DEFAULT_HOURS = {
    "mon" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "tue" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "wed" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "thu" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "fri" => { "is_open" => true, "open" => "07:00", "close" => "20:00" },
    "sat" => { "is_open" => true, "open" => "08:00", "close" => "20:00" },
    "sun" => { "is_open" => true, "open" => "08:00", "close" => "18:00" }
  }.freeze

  def normalize_brand_color
    self.brand_color = brand_color.to_s.strip.downcase
  end

  def brand_color_is_usable
    unless brand_color.match?(HEX_COLOR)
      errors.add(:base, "El color de marca debe ser un hexadecimal de 6 dígitos, por ejemplo #8c3d25.")
      return
    end

    cream = WcagContrast.ratio(brand_color, CREAM_CANVAS)
    white = WcagContrast.ratio(brand_color, WHITE)
    return if cream >= MIN_CONTRAST_RATIO && white >= MIN_CONTRAST_RATIO

    errors.add(:base, "El color de marca no alcanza el contraste WCAG AA (4.5:1) sobre el fondo crema ni con texto blanco.")
  end

  def display_font_is_curated
    return if DISPLAY_FONTS.key?(display_font)

    errors.add(:base, "La tipografía debe elegirse de la lista.")
  end

  def acceptable_hero_photo
    return unless hero_photo.attached?

    blob = hero_photo.blob
    unless blob.content_type.in?(%w[image/jpeg image/png image/webp])
      errors.add(:base, "La foto de portada debe ser JPG, PNG o WebP.")
    end
    return if blob.byte_size.to_i <= HERO_MAX_BYTES

    errors.add(:base, "La foto de portada debe pesar hasta 5 MB.")
  end

  def operating_hours
    super.presence || DEFAULT_HOURS
  end

  def self.hours_valid?(raw)
    return false unless raw.is_a?(Hash)

    raw.all? do |day, value|
      next false unless DAY_KEYS.include?(day.to_s) && value.is_a?(Hash)
      next true unless day_open?(value)

      open_time = day_value(value, "open")
      close_time = day_value(value, "close")
      TIME_PATTERN.match?(open_time) && TIME_PATTERN.match?(close_time) && close_time > open_time
    end
  end

  def self.confirmed_open_day?(raw)
    return false unless hours_valid?(raw)

    raw.any? { |_day, value| value.is_a?(Hash) && day_open?(value) }
  end

  def self.day_open?(value)
    ActiveModel::Type::Boolean.new.cast(day_value(value, "is_open"))
  end

  def self.day_value(value, key)
    if value.key?(key)
      value[key]
    elsif value.key?(key.to_sym)
      value[key.to_sym]
    end.to_s
  end

  def operating_hours_are_usable
    raw = read_attribute(:operating_hours)
    return if raw.blank?
    return if self.class.hours_valid?(raw)

    errors.add(:operating_hours, "hours_invalid")
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

  def open_now?
    open_at?(Time.current)
  end

  def ordering_status
    return "not_accepting" unless accepting_pickup?
    return "closed" unless open_now?

    "open"
  end

  def today_hours
    Time.use_zone(timezone) { hours_for(Time.zone.today) }
  end

  def ordering_payload
    today = today_hours || {}
    {
      open_now: open_now?,
      accepting_pickup: accepting_pickup?,
      asap_available: accepting_pickup? && open_now?,
      status: ordering_status,
      today: {
        is_open: ActiveModel::Type::Boolean.new.cast(today["is_open"]) == true,
        open: today["open"],
        close: today["close"]
      }
    }
  end

  def checkout_blocked_reason(pickup_type)
    return "not_accepting" unless accepting_pickup?
    return "shop_closed" if pickup_type.to_s != "scheduled" && !open_now?

    nil
  end

  def directions_url
    if lat.present? && lng.present?
      "https://www.google.com/maps/search/?api=1&query=#{lat},#{lng}"
    elsif address.present?
      "https://www.google.com/maps/search/?api=1&query=#{CGI.escape(address)}"
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
        capacity = slot ? slot.capacity : slot_capacity

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
