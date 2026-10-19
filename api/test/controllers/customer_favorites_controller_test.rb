require "test_helper"

class CustomerFavoritesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner@example.com", password: "password123")
    @customer_user = User.create!(email: "customer@example.com", password: "password123")

    @shop = Shop.create!(name: "Cafe A", slug: "cafe-a", currency: "MXN", owner: @owner)
    @category = MenuCategory.create!(shop: @shop, name: "Bebidas", sort_order: 1)
    @item = MenuItem.create!(shop: @shop, category: @category, name: "Latte", price_cents: 5000, sort_order: 1)

    @customer = Customer.create!(user: @customer_user, name: "Cliente", phone: "+525555555555")

    @owner_token = JsonWebToken.encode(user_id: @owner.id)
    @customer_token = JsonWebToken.encode(user_id: @customer_user.id)
  end

  test "customer can list favorites" do
    CustomerFavorite.create!(customer: @customer, shop: @shop, menu_item: @item)

    get shop_favorites_url(@shop), headers: { "Authorization" => "Bearer #{@customer_token}" }
    assert_response :success

    item_ids = response.parsed_body["favorites"].map { |f| f["menu_item_id"] }
    assert_includes item_ids, @item.id
  end

  test "customer can add a favorite" do
    assert_difference "CustomerFavorite.count", 1 do
      post shop_favorites_url(@shop), params: { menu_item_id: @item.id }, headers: { "Authorization" => "Bearer #{@customer_token}" }
    end
    assert_response :created
  end

  test "customer can remove a favorite" do
    CustomerFavorite.create!(customer: @customer, shop: @shop, menu_item: @item)

    assert_difference "CustomerFavorite.count", -1 do
      delete shop_favorite_url(@shop, @item.id), headers: { "Authorization" => "Bearer #{@customer_token}" }
    end
    assert_response :no_content
  end

  test "unauthenticated requests are rejected" do
    get shop_favorites_url(@shop)
    assert_response :unauthorized
  end

  test "favorites are scoped to the shop" do
    other_shop = Shop.create!(name: "Cafe B", slug: "cafe-b", currency: "MXN", owner: @owner)
    CustomerFavorite.create!(customer: @customer, shop: other_shop, menu_item: @item)

    get shop_favorites_url(@shop), headers: { "Authorization" => "Bearer #{@customer_token}" }
    assert_response :success

    item_ids = response.parsed_body["favorites"].map { |f| f["menu_item_id"] }
    assert_not_includes item_ids, @item.id
  end
end
