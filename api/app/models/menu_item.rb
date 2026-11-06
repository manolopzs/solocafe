class MenuItem < ApplicationRecord
  include TenantScoped

  PHOTO_MAX_BYTES = 5.megabytes

  belongs_to :category, class_name: "MenuCategory", optional: true
  has_many :item_modifier_links, foreign_key: :item_id, dependent: :destroy
  has_many :modifier_groups, through: :item_modifier_links, source: :group
  has_many :order_items, foreign_key: :item_id, dependent: :restrict_with_error
  has_many :customer_favorites, dependent: :destroy
  has_one_attached :photo

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :may_contain_traces, inclusion: { in: [true, false] }
  validate :acceptable_photo
  validate :allergens_are_valid

  before_validation :reject_blank_allergens, :normalize_allergens

  def public_image_url
    return image_url unless photo.attached?

    options = ActiveStorage::Current.url_options
    return image_url if options.blank?

    Rails.application.routes.url_helpers.rails_blob_url(photo, **options, disposition: "inline")
  end

  private

  def acceptable_photo
    return unless photo.attached?

    blob = photo.blob
    unless blob.content_type.in?(%w[image/jpeg image/png image/webp])
      errors.add(:base, "La foto debe ser JPG, PNG o WebP.")
    end
    return if blob.byte_size.to_i <= PHOTO_MAX_BYTES

    errors.add(:base, "La foto debe pesar hasta 5 MB.")
  end

  def reject_blank_allergens
    self.allergens = (allergens || []).reject(&:blank?)
  end

  def normalize_allergens
    self.allergens = (allergens || []).map(&:to_s).uniq.sort
  end

  def allergens_are_valid
    invalid = (allergens || []).reject { |code| Allergen::CODES.include?(code) }
    return if invalid.empty?

    errors.add(:allergens, "contiene códigos no válidos: #{invalid.join(', ')}")
  end
end
