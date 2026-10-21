require "test_helper"

class Public::StorefrontsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @shop = Shop.create!(
      name: "Café Norte",
      slug: "cafe-norte-store",
      currency: "EUR",
      timezone: "Europe/Madrid",
      address: "Calle de la Palma 12, Madrid",
      status: "active"
    )
    Current.shop = @shop
    @category = MenuCategory.create!(shop: @shop, name: "Bebidas calientes", sort_order: 1)
    @item = MenuItem.create!(
      shop: @shop,
      category: @category,
      name: "Café",
      description: "Café espresso",
      price_cents: 180,
      is_active: true
    )
  end

  teardown do
    Current.shop = nil
  end

  test "returns the shop and menu in one response" do
    get "/public/storefront/#{@shop.slug}"

    assert_response :success
    body = response.parsed_body
    assert_equal @shop.id, body.dig("shop", "id")
    assert_equal "EUR", body.dig("shop", "currency")
    assert_equal "Café", body.dig("items", 0, "name")
    assert_equal "Café espresso", body.dig("items", 0, "description")
    assert_equal "Bebidas calientes", body.dig("categories", 0, "name")
    assert_match(/public/, response.headers["Cache-Control"])
  end

  test "does not publish another shop menu" do
    other = Shop.create!(name: "Ajena", slug: "ajena-store", currency: "EUR", status: "active")
    Current.shop = other
    MenuItem.create!(shop: other, name: "Secreto", description: "No", price_cents: 100, is_active: true)

    get "/public/storefront/#{@shop.slug}"

    assert_response :success
    names = response.parsed_body["items"].map { |item| item["name"] }
    assert_equal [ "Café" ], names
  end
end
