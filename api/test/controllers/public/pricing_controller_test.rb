require "test_helper"

class Public::PricingControllerTest < ActionDispatch::IntegrationTest
  setup do
    @free = SubscriptionTier.create!(
      name: "Free",
      monthly_price_cents: 0,
      included_orders: 100,
      overage_per_order_cents: 0,
      is_active: true
    )
    @inactive = SubscriptionTier.create!(
      name: "Archived",
      monthly_price_cents: 0,
      included_orders: 1,
      overage_per_order_cents: 0,
      is_active: false
    )
  end

  test "returns active tiers and the configured platform fee without auth" do
    previous = ENV["PLATFORM_FEE_PERCENT"]
    ENV["PLATFORM_FEE_PERCENT"] = "0"

    get "/public/pricing"

    assert_response :success
    body = response.parsed_body
    assert_in_delta 0.0, body["platform_fee_percent"].to_f, 0.001

    names = body["tiers"].map { |tier| tier["name"] }
    assert_includes names, "Free"
    assert_not_includes names, "Archived"

    free = body["tiers"].find { |tier| tier["name"] == "Free" }
    assert_equal @free.monthly_price_cents, free["monthly_price_cents"]
    assert_equal @free.included_orders, free["included_orders"]
    assert_equal @free.overage_per_order_cents, free["overage_per_order_cents"]
    assert_equal %w[included_orders monthly_price_cents name overage_per_order_cents], free.keys.sort
  ensure
    ENV["PLATFORM_FEE_PERCENT"] = previous
  end

  test "reads platform fee percent from the environment" do
    previous = ENV["PLATFORM_FEE_PERCENT"]
    ENV["PLATFORM_FEE_PERCENT"] = "7"

    get "/public/pricing"

    assert_response :success
    assert_in_delta 7.0, response.parsed_body["platform_fee_percent"].to_f, 0.001
  ensure
    ENV["PLATFORM_FEE_PERCENT"] = previous
  end
end
