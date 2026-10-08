SubscriptionTier.find_or_create_by!(name: "Free") do |tier|
  tier.monthly_price_cents = 0
  tier.included_orders = 100
  tier.overage_per_order_cents = 0
  tier.is_active = true
end
