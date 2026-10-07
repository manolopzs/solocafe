class ModifierGroup < ApplicationRecord
  include TenantScoped

  has_many :modifier_options, foreign_key: :group_id, dependent: :destroy
  has_many :item_modifier_links, dependent: :destroy
  has_many :menu_items, through: :item_modifier_links

  validates :name, presence: true
  validates :max_select, numericality: { greater_than_or_equal_to: 1 }
end
