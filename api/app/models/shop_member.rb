class ShopMember < ApplicationRecord
  belongs_to :shop
  belongs_to :user

  enum :role, { owner: "owner", manager: "manager", barista: "barista" }, prefix: true

  validates :user_id, uniqueness: { scope: :shop_id }
end
