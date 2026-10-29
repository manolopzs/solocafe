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
  has_many :loyalty_stamps, dependent: :destroy
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
  validate :coordinates_are_in_range
  validates :locale, inclusion: { in: %w[es en] }
  validates :slot_duration_minutes, numericality: { greater_than_or_equal_to: 5 }
  validates :slot_capacity, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 500 }
  validates :prep_time_buffer_minutes, numericality: { greater_than_or_equal_to: 0 }
  validates :max_days_ahead, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 30 }
  validates :loyalty_stamps_required, numericality: {
    only_integer: true,
    greater_than: 0,
    less_than_or_equal_to: 50,
    message: "debe ser un entero entre 1 y 50"
  }
  validates :loyalty_reward_text, presence: { message: "no puede estar vacío" }, length: { maximum: 80 }
  validate :operating_hours_are_usable
  validate :brand_color_is_usable
  validate :display_font_is_curated
  validate :acceptable_hero_photo

  before_validation :normalize_brand_color
  before_validation :normalize_loyalty_reward_text

  class TestShopFlagRefused < StandardError; end

  OBVIOUS_TEST_NAME_PHRASES = [
    "analytics cafe",
    "reorder test",
    "test cafe",
    "test cafeteria",
    "cafe public menu test",
    "cafeteria public menu test",
  ].freeze
  OBVIOUS_TEST_ADDRESSES = [ "test", "a" ].freeze

  scope :active, -> { where(status: "active") }
  scope :published, -> { where(status: "active") }
  scope :discoverable, -> { published.where(test_shop: false) }

  # Spherical haversine, kilometers. Binds are origin latitude, origin latitude, origin longitude.
  # LEAST ignores NULLs in PostgreSQL, so shops without coordinates are handled before the formula.
  DISTANCE_SQL = <<~SQL.squish.freeze
    CASE
      WHEN shops.lat IS NULL OR shops.lng IS NULL THEN NULL
      ELSE 2 * 6371.0 * ASIN(SQRT(LEAST(1.0,
        POWER(SIN(RADIANS(shops.lat - ?) / 2), 2) +
        COS(RADIANS(?)) * COS(RADIANS(shops.lat)) * POWER(SIN(RADIANS(shops.lng - ?) / 2), 2)
      )))
    END AS distance_km
  SQL
  DISTANCE_ORDER = Arel.sql("(shops.lat IS NULL OR shops.lng IS NULL) ASC, distance_km ASC NULLS LAST, shops.name ASC")

  def self.explore(lat: nil, lng: nil, include_closed: false)
    TenantScoped.unscoped_for_system do
      directory = discoverable.with_attached_hero_photo
      shops = if lat && lng
        directory
          .select("shops.*", sanitize_sql_array([ DISTANCE_SQL, lat, lat, lng ]))
          .order(DISTANCE_ORDER)
          .to_a
      else
        directory.order(:name).to_a
      end
      include_closed ? shops : shops.select(&:open_now?)
    end
  end

  def self.obvious_test_shop?(shop)
    obvious_test_name?(shop.name) || obvious_test_address?(shop.address)
  end

  def self.obvious_test_name?(name)
    normalized = name.to_s.strip.gsub(/\s+/, " ")
    folded = I18n.transliterate(normalized).downcase
    return true if OBVIOUS_TEST_NAME_PHRASES.any? { |phrase| folded.include?(phrase) }

    normalized.match?(/\A\p{L}\z/)
  end

  def self.obvious_test_address?(address)
    OBVIOUS_TEST_ADDRESSES.include?(address.to_s.strip.downcase)
  end

  # Marks matching shops in place. Never deletes rows and refuses production.
  def self.flag_obvious_test_shops!(dry_run:, environment: Rails.env)
    if environment.production?
      raise TestShopFlagRefused, "shops:flag_test_shops refuses to run in production"
    end

    lines = []
    find_each do |shop|
      next unless obvious_test_shop?(shop)

      if dry_run
        lines << "dry_run #{shop.id} #{shop.name}"
      elsif shop.test_shop?
        lines << "already_flagged #{shop.id} #{shop.name}"
      else
        shop.update!(test_shop: true)
        lines << "flagged #{shop.id} #{shop.name}"
      end
    end
    lines
  end

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

  def normalize_loyalty_reward_text
    self.loyalty_reward_text = loyalty_reward_text.to_s.strip
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

  def coordinates_are_in_range
    if lat.present? && !lat.between?(-90, 90)
      errors.add(:base, "La latitud debe estar entre -90 y 90.")
    end
    if lng.present? && !lng.between?(-180, 180)
      errors.add(:base, "La longitud debe estar entre -180 y 180.")
    end
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
