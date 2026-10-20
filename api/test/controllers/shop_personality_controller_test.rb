require "test_helper"

class ShopPersonalityControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner-personality@example.com", password: "password123")
    @other_user = User.create!(email: "other-personality@example.com", password: "password123")
    @token = JsonWebToken.encode(user_id: @owner.id)

    @shop = Shop.create!(
      name: "Cafe Norte",
      slug: "cafe-norte",
      currency: "MXN",
      owner: @owner,
      address: "Reforma 10",
      lat: 19.43,
      lng: -99.13,
      brand_color: "#8c3d25",
      display_font: "dm_sans"
    )
    @other = Shop.create!(
      name: "Cafe Sur",
      slug: "cafe-sur",
      currency: "MXN",
      owner: @other_user,
      address: "Juarez 20",
      lat: 19.42,
      lng: -99.14,
      brand_color: "#5c3317",
      display_font: "literata"
    )

    ShopMember.create!(shop: @shop, user: @owner, role: :owner)
    ShopMember.create!(shop: @other, user: @other_user, role: :owner)
  end

  test "a member can save brand color display font and hero photo for their shop" do
    patch "/shops/#{@shop.id}",
      params: {
        shop: {
          brand_color: "#1F4D3A",
          display_font: "fraunces",
          hero_photo: fixture_file_upload("hero.png", "image/png")
        }
      },
      headers: auth_headers

    assert_response :success
    body = response.parsed_body["shop"]
    assert_equal @shop.id, body["id"]
    assert_equal "#1f4d3a", body["brand_color"]
    assert_equal "fraunces", body["display_font"]
    assert_equal "Fraunces", body["display_font_family"]
    assert_match %r{/rails/active_storage/}, body["hero_photo_url"]

    @shop.reload
    assert_equal "#1f4d3a", @shop.brand_color
    assert_equal "fraunces", @shop.display_font
    assert @shop.hero_photo.attached?

    uri = URI(body["hero_photo_url"])
    get uri.request_uri
    assert_response :redirect
    follow_redirect!
    assert_response :success
    assert_equal "image/png", response.media_type
  end

  test "updating one shop does not change another shop personality" do
    patch "/shops/#{@shop.id}",
      params: {
        shop: {
          brand_color: "#1f4d3a",
          display_font: "newsreader",
          hero_photo: fixture_file_upload("hero.png", "image/png")
        }
      },
      headers: auth_headers

    assert_response :success
    @other.reload
    assert_equal "#5c3317", @other.brand_color
    assert_equal "literata", @other.display_font
    assert_not @other.hero_photo.attached?
  end

  test "a member cannot change another shop personality" do
    patch "/shops/#{@other.id}",
      params: {
        shop: {
          brand_color: "#1f4d3a",
          display_font: "fraunces",
          hero_photo: fixture_file_upload("hero.png", "image/png")
        }
      },
      headers: auth_headers

    assert_response :not_found
    @other.reload
    assert_equal "#5c3317", @other.brand_color
    assert_equal "literata", @other.display_font
    assert_not @other.hero_photo.attached?
    assert_equal "#8c3d25", @shop.reload.brand_color
  end

  test "public shop json returns only that shop personality" do
    @shop.update!(brand_color: "#1f4d3a", display_font: "fraunces")
    @shop.hero_photo.attach(io: File.open(file_fixture("hero.png")), filename: "hero.png", content_type: "image/png")
    @other.hero_photo.attach(io: File.open(file_fixture("hero.png")), filename: "other.png", content_type: "image/png")

    get "/shops/#{@shop.slug}"
    assert_response :success
    shop = response.parsed_body["shop"]
    assert_equal "#1f4d3a", shop["brand_color"]
    assert_equal "fraunces", shop["display_font"]
    assert_equal "Fraunces", shop["display_font_family"]
    assert_match %r{/rails/active_storage/}, shop["hero_photo_url"]
    assert_not_includes shop["hero_photo_url"], @other.hero_photo.blob.key

    get "/shops/#{@other.slug}"
    other = response.parsed_body["shop"]
    assert_equal "#5c3317", other["brand_color"]
    assert_equal "literata", other["display_font"]
    assert_equal "Literata", other["display_font_family"]
    assert_not_equal shop["hero_photo_url"], other["hero_photo_url"]
  end

  test "public shop list keeps each shop personality separate" do
    @shop.update!(brand_color: "#1f4d3a", display_font: "libre_baskerville")

    get "/public/shops"
    assert_response :success
    shops = response.parsed_body["shops"].index_by { |shop| shop["slug"] }

    assert_equal "#1f4d3a", shops["cafe-norte"]["brand_color"]
    assert_equal "libre_baskerville", shops["cafe-norte"]["display_font"]
    assert_nil shops["cafe-norte"]["hero_photo_url"]
    assert_includes [ true, false ], shops["cafe-norte"]["open_now"]

    assert_equal "#5c3317", shops["cafe-sur"]["brand_color"]
    assert_equal "literata", shops["cafe-sur"]["display_font"]
    assert_not_equal shops["cafe-norte"]["slug"], shops["cafe-sur"]["slug"]
  end

  test "rejects a brand color without enough contrast and leaves the shop unchanged" do
    patch "/shops/#{@shop.id}",
      params: { shop: { brand_color: "#c17c5b", display_font: "fraunces" } },
      headers: auth_headers

    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"].join(" "), "contraste WCAG AA"
    assert_equal "#8c3d25", @shop.reload.brand_color
    assert_equal "dm_sans", @shop.display_font
  end

  test "rejects a display font outside the curated list" do
    patch "/shops/#{@shop.id}",
      params: { shop: { display_font: "comic_sans" } },
      headers: auth_headers

    assert_response :unprocessable_entity
    assert_equal "dm_sans", @shop.reload.display_font
  end

  test "a member can remove their hero photo without touching another shop" do
    @shop.hero_photo.attach(io: File.open(file_fixture("hero.png")), filename: "hero.png", content_type: "image/png")
    @other.hero_photo.attach(io: File.open(file_fixture("hero.png")), filename: "other.png", content_type: "image/png")

    patch "/shops/#{@shop.id}",
      params: { shop: { remove_hero_photo: "1" } },
      headers: auth_headers

    assert_response :success
    assert_nil response.parsed_body["shop"]["hero_photo_url"]
    assert_not @shop.reload.hero_photo.attached?
    assert @other.reload.hero_photo.attached?
  end

  test "owner configures the stamp card without changing another shop" do
    patch "/shops/#{@shop.id}",
      params: { shop: { loyalty_stamps_required: 8, loyalty_reward_text: "Un croissant" } },
      headers: auth_headers

    assert_response :success
    body = response.parsed_body["shop"]
    assert_equal 8, body["loyalty_stamps_required"]
    assert_equal "Un croissant", body["loyalty_reward_text"]
    assert_equal 8, @shop.reload.loyalty_stamps_required
    assert_equal 10, @other.reload.loyalty_stamps_required
    assert_equal "Un artículo gratis", @other.loyalty_reward_text
  end

  test "blank reward text is rejected" do
    patch "/shops/#{@shop.id}",
      params: { shop: { loyalty_reward_text: "   " } },
      headers: auth_headers

    assert_response :unprocessable_entity
    assert_equal "Un artículo gratis", @shop.reload.loyalty_reward_text
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end
end
