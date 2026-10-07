class MenuItem < ApplicationRecord
  include TenantScoped

  belongs_to :category, class_name: "MenuCategory", optional: true
  has_many :item_modifier_links, dependent: :destroy
  has_many :modifier_groups, through: :item_modifier_links
  has_many :order_items, dependent: :restrict_with_error

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
end
