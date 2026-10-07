class ShopSubscription < ApplicationRecord
  belongs_to :shop
  belongs_to :tier, class_name: "SubscriptionTier"

  enum :status, { active: "active", canceled: "canceled", past_due: "past_due" }, prefix: true

  validates :shop_id, uniqueness: true
end
