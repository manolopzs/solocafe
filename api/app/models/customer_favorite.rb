class CustomerFavorite < ApplicationRecord
  belongs_to :customer
  belongs_to :shop
  belongs_to :menu_item

  validates :menu_item_id, uniqueness: { scope: [:customer_id, :shop_id] }
end
