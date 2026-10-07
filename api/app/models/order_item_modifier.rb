class OrderItemModifier < ApplicationRecord
  belongs_to :order_item
  belongs_to :option, class_name: "ModifierOption"

  validates :option_name_snapshot, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
end
