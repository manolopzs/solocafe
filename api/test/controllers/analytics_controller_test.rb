require "test_helper"

class AnalyticsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner_a = User.create!(email: "analytics-a@example.com", password: "password123")
    @owner_b = User.create!(email: "analytics-b@example.com", password: "password123")
    @shop_a = Shop.create!(name: "Cafe A", slug: "analytics-a", currency: "MXN", owner: @owner_a)
    @shop_b = Shop.create!(name: "Cafe B", slug: "analytics-b", currency: "MXN", owner: @owner_b)
    ShopMember.create!(shop: @shop_a, user: @owner_a, role: :owner)
    ShopMember.create!(shop: @shop_b, user: @owner_b, role: :owner)

    create_order(@shop_a, 1800)
    create_order(@shop_b, 4200)

    @token_a = JsonWebToken.encode(user_id: @owner_a.id)
  end

  test "shop A summary does not read shop B revenue" do
    get "/shops/#{@shop_a.id}/analytics/summary", params: { days: "all" }, headers: auth_headers

    assert_response :success
    body = response.parsed_body
    assert_equal 1, body["order_count"]
    assert_equal 1800, body["revenue_cents"]
    assert_equal 1800, body["average_ticket_cents"]
  end

  test "shop A cannot open shop B analytics summary" do
    get "/shops/#{@shop_b.id}/analytics/summary", params: { days: "all" }, headers: auth_headers

    assert_response :forbidden
    stored = TenantScoped.unscoped_for_system { Order.where(shop: @shop_b).sum(:total_cents) }
    assert_equal 4200, stored
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token_a}" }
  end

  def create_order(shop, total_cents)
    Order.create!(
      shop: shop,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: total_cents,
      total_cents: total_cents,
      currency: "MXN",
      pickup_type: "asap"
    )
  end
end
