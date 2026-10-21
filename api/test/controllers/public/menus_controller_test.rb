require "test_helper"

class Public::MenusControllerTest < ActionDispatch::IntegrationTest
  setup do
    @shop = Shop.create!(name: "Café Centro", slug: "cafe-centro-menu", currency: "EUR", timezone: "Europe/Madrid", status: "active")
    Current.shop = @shop
  end

  teardown do
    Current.shop = nil
  end

  test "keeps spanish accents in the item name and description" do
    MenuItem.create!(
      shop: @shop,
      name: "Café",
      description: "Café con leche fría",
      price_cents: 220,
      is_active: true
    )

    get "/public/shops/#{@shop.id}/menu"

    assert_response :success
    assert_includes response.headers["Content-Type"], "charset=utf-8"
    item = response.parsed_body["items"].find { |row| row["name"] == "Café" }
    assert_equal "Café con leche fría", item["description"]
    assert_equal "EUR", response.parsed_body.dig("shop", "currency")
  end

  test "serves an attached photo as the public image and describes the item" do
    item = MenuItem.create!(
      shop: @shop,
      name: "Café",
      description: "Espresso corto",
      price_cents: 180,
      image_url: "https://images.example/original.jpg",
      is_active: true
    )
    item.photo.attach(io: File.open(file_fixture("hero.png")), filename: "cafe.png", content_type: "image/png")

    get "/public/shops/#{@shop.id}/menu"

    assert_response :success
    payload = response.parsed_body["items"].find { |row| row["id"] == item.id }
    assert_equal "Espresso corto", payload["description"]
    assert_match %r{/rails/active_storage/}, payload["image_url"]
    assert_not_includes payload["image_url"], "images.example"
  end

  test "public menu sends an etag and a short public cache" do
    MenuItem.create!(shop: @shop, name: "Café", description: "Café", price_cents: 180, is_active: true)

    get "/public/shops/#{@shop.id}/menu"
    assert_response :success
    assert_match(/public/, response.headers["Cache-Control"])
    etag = response.headers["ETag"]
    assert etag.present?

    get "/public/shops/#{@shop.id}/menu", headers: { "If-None-Match" => etag }
    assert_response :not_modified
  end
end
