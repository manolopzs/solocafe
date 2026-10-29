class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :item, class_name: "MenuItem"
  has_many :order_item_modifiers, dependent: :destroy

  validates :item_name_snapshot, presence: true
  validates :unit_price_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :quantity, numericality: { greater_than_or_equal_to: 1 }
  validates :subtotal_cents, numericality: { greater_than_or_equal_to: 0 }
  validate :allergens_snapshot_are_valid

  before_validation :reject_blank_allergens_snapshot, :normalize_allergens_snapshot

  private

  def reject_blank_allergens_snapshot
    self.allergens_snapshot = (allergens_snapshot || []).reject(&:blank?)
  end

  def normalize_allergens_snapshot
    self.allergens_snapshot = (allergens_snapshot || []).map(&:to_s).uniq.sort
  end

  def allergens_snapshot_are_valid
    invalid = (allergens_snapshot || []).reject { |code| Allergen::CODES.include?(code) }
    return if invalid.empty?

    errors.add(:allergens_snapshot, "contiene códigos no válidos: #{invalid.join(', ')}")
  end
end
