class ModifierOption < ApplicationRecord
  belongs_to :group, class_name: "ModifierGroup"
  has_many :order_item_modifiers, foreign_key: :option_id, dependent: :restrict_with_error

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
end
