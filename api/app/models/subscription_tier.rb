class SubscriptionTier < ApplicationRecord
  has_many :shop_subscriptions, dependent: :restrict_with_error
end
