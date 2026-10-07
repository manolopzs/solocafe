class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :item, class_name: "MenuItem"
  has_many :order_item_modifiers, dependent: :destroy

  validates :item_name_snapshot, presence: true
  validates :unit_price_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :quantity, numericality: { greater_than_or_equal_to: 1 }
  validates :subtotal_cents, numericality: { greater_than_or_equal_to: 0 }
end
