class MenuCategory < ApplicationRecord
  include TenantScoped

  has_many :menu_items, foreign_key: :category_id, dependent: :nullify

  validates :name, presence: true
end
