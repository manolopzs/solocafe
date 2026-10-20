module Public
  class PricingController < ApplicationController
    def show
      tiers = SubscriptionTier.where(is_active: true).order(:monthly_price_cents, :name)

      render json: {
        platform_fee_percent: platform_fee_percent,
        tiers: tiers.map { |tier| tier_payload(tier) }
      }
    end

    private

    def platform_fee_percent
      ENV.fetch("PLATFORM_FEE_PERCENT", "0").to_f
    end

    def tier_payload(tier)
      {
        name: tier.name,
        monthly_price_cents: tier.monthly_price_cents,
        included_orders: tier.included_orders,
        overage_per_order_cents: tier.overage_per_order_cents
      }
    end
  end
end
