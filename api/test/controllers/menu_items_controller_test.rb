require "test_helper"

class MenuItemsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner-menu@example.com", password: "password123")
    @other_user = User.create!(email: "other-menu@example.com", password: "password123")

    @shop = Shop.create!(name: "Cafe A", slug: "cafe-menu-a", currency: "EUR", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe B", slug: "cafe-menu-b", currency: "EUR", owner: @other_user)

    ShopMember.create!(shop: @shop, user: @owner, role: :owner)
    ShopMember.create!(shop: @other_shop, user: @other_user, role: :owner)

    @item = MenuItem.create!(shop: @shop, name: "Croissant", price_cents: 250)

    @token = JsonWebToken.encode(user_id: @owner.id)
  end

  test "owner can update allergens on their shop item" do
    patch shop_menu_item_url(@shop, @item),
      params: {
        menu_item: {
          allergens: %w[gluten milk],
          may_contain_traces: true
        }
      },
      headers: auth_headers,
      as: :json

    assert_response :success
    body = response.parsed_body["item"]
    assert_equal %w[gluten milk], body["allergens"]
    assert_equal true, body["may_contain_traces"]

    @item.reload
    assert_equal %w[gluten milk], @item.allergens
    assert @item.may_contain_traces
  end

  test "owner can clear all allergens" do
    @item.update!(allergens: %w[gluten], may_contain_traces: true)

    patch shop_menu_item_url(@shop, @item),
      params: { menu_item: { allergens: [], may_contain_traces: false } },
      headers: auth_headers,
      as: :json

    assert_response :success
    assert_equal [], response.parsed_body["item"]["allergens"]
    assert_equal false, response.parsed_body["item"]["may_contain_traces"]
  end

  test "cannot update another shop's item" do
    patch shop_menu_item_url(@other_shop, @item),
      params: { menu_item: { allergens: %w[peanuts] } },
      headers: auth_headers,
      as: :json

    assert_response :forbidden
  end

  test "index includes allergens for the current shop" do
    MenuItem.create!(shop: @shop, name: "Agua", price_cents: 100)

    get shop_menu_items_url(@shop), headers: auth_headers

    assert_response :success
    items = response.parsed_body["items"]
    allergens = items.find { |i| i["id"] == @item.id }["allergens"]
    assert_equal [], allergens
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end
end
