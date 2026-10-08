require "test_helper"

class OrdersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner@example.com", password: "password123")
    @other_user = User.create!(email: "other@example.com", password: "password123")

    @shop = Shop.create!(name: "Cafe A", slug: "cafe-a", currency: "MXN", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe B", slug: "cafe-b", currency: "MXN", owner: @other_user)

    ShopMember.create!(shop: @shop, user: @owner, role: :owner)
    ShopMember.create!(shop: @other_shop, user: @other_user, role: :owner)

    @order = create_order(@shop)
    @other_order = create_order(@other_shop)

    @token = JsonWebToken.encode(user_id: @owner.id)
  end

  test "staff can list their own shop orders" do
    get shop_orders_url(@shop), headers: auth_headers
    assert_response :success

    order_ids = response.parsed_body["orders"].map { |o| o["id"] }
    assert_includes order_ids, @order.id
    assert_not_includes order_ids, @other_order.id
  end

  test "staff cannot list another shop orders" do
    get shop_orders_url(@other_shop), headers: auth_headers
    assert_response :forbidden
  end

  test "staff cannot update another shop order" do
    patch shop_order_url(@other_shop, @other_order), params: { status: "ready" }, headers: auth_headers
    assert_response :forbidden
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end

  def create_order(shop)
    Order.create!(
      shop: shop,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )
  end
end
