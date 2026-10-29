require "test_helper"

class Public::ShopsControllerTest < ActionDispatch::IntegrationTest
  PUBLIC_FIELDS = %w[address brand_color display_font hero_photo_url name open_now slug].freeze
  DISTANCE_FIELDS = (PUBLIC_FIELDS + %w[distance_km]).sort.freeze

  setup do
    @zone = Time.find_zone!("America/Mexico_City")
  end

  teardown do
    Current.shop = nil
  end

  test "returns only public fields" do
    travel_to @zone.local(2026, 10, 19, 12, 0, 0) do
      open_shop = create_shop(
        name: "Cafe Abierto",
        slug: "cafe-abierto",
        address: "Orizaba 10",
        brand_color: "#1f4d3a",
        display_font: "fraunces",
        stripe_account_id: "acct_secret_open"
      )
      closed_shop = create_shop(
        name: "Cafe Cerrado",
        slug: "cafe-cerrado",
        address: nil,
        operating_hours: closed_hours,
        stripe_account_id: "acct_secret_closed"
      )

      get "/public/shops"

      assert_response :success
      body = response.parsed_body
      assert_equal "name", body["sort"]
      shops = body["shops"].index_by { |shop| shop["slug"] }

      assert_equal [ "cafe-abierto" ], shops.keys.sort
      shops.each_value do |shop|
        assert_equal PUBLIC_FIELDS, shop.keys.sort
      end

      opened = shops["cafe-abierto"]
      assert_equal "Cafe Abierto", opened["name"]
      assert_equal "Orizaba 10", opened["address"]
      assert_equal true, opened["open_now"]
      assert_equal "#1f4d3a", opened["brand_color"]
      assert_equal "fraunces", opened["display_font"]
      assert_nil opened["hero_photo_url"]

      get "/public/shops", params: { include_closed: "1" }

      assert_response :success
      with_closed = response.parsed_body["shops"].index_by { |shop| shop["slug"] }
      assert_equal [ "cafe-abierto", "cafe-cerrado" ], with_closed.keys.sort
      assert_equal false, with_closed["cafe-cerrado"]["open_now"]
      assert_nil with_closed["cafe-cerrado"]["address"]

      assert_not_includes response.body, open_shop.id
      assert_not_includes response.body, closed_shop.id
      assert_not_includes response.body, "acct_secret_open"
      assert_not_includes response.body, "acct_secret_closed"
      assert_not_includes response.body, "MXN"
      assert_not_includes response.body, "display_font_family"
    end
  end

  test "orders shops by haversine distance from lat and lng" do
    create_shop(name: "Cafe Alba", slug: "cafe-alba", lat: 19.0, lng: -99.0)
    create_shop(name: "Cafe Boreal", slug: "cafe-boreal", lat: 20.0, lng: -99.0)
    create_shop(name: "Cafe Centro", slug: "cafe-centro", lat: 19.4, lng: -99.0)
    create_shop(name: "Cafe Zeta", slug: "cafe-zeta")

    travel_to open_moment do
    get "/public/shops", params: { lat: 19.99, lng: -99.0 }

    assert_response :success
    body = response.parsed_body
    assert_equal "distance", body["sort"]
    shops = body["shops"]
    assert_equal %w[cafe-boreal cafe-centro cafe-alba cafe-zeta], shops.map { |shop| shop["slug"] }

    shops.each do |shop|
      assert_equal DISTANCE_FIELDS, shop.keys.sort
    end

    distances = shops.map { |shop| shop["distance_km"] }
    assert_operator distances[0], :<, distances[1]
    assert_operator distances[1], :<, distances[2]
    assert_nil distances[3]
    end
  end

  test "lists active shops alphabetically when location is missing or invalid" do
    create_shop(name: "Cafe Boreal", slug: "cafe-boreal", lat: 20.0, lng: -99.0)
    create_shop(name: "Cafe Alba", slug: "cafe-alba", lat: 19.0, lng: -99.0)
    create_shop(name: "Cafe Zeta", slug: "cafe-zeta")

    travel_to open_moment do
    get "/public/shops"
    assert_response :success
    assert_equal "name", response.parsed_body["sort"]
    assert_equal %w[cafe-alba cafe-boreal cafe-zeta], response.parsed_body["shops"].map { |shop| shop["slug"] }
    assert response.parsed_body["shops"].all? { |shop| shop.keys.sort == PUBLIC_FIELDS }

    get "/public/shops", params: { lat: "nope", lng: -99.0 }
    assert_response :success
    assert_equal "name", response.parsed_body["sort"]
    assert_equal %w[cafe-alba cafe-boreal cafe-zeta], response.parsed_body["shops"].map { |shop| shop["slug"] }

    get "/public/shops", params: { lat: 19.4 }
    assert_response :success
    assert_equal "name", response.parsed_body["sort"]
    end
  end

  test "excludes shops that are not active" do
    create_shop(name: "Viva", slug: "viva", lat: 19.4, lng: -99.1, status: "active")
    create_shop(name: "Borrador", slug: "borrador", lat: 19.4, lng: -99.1, status: "draft")
    create_shop(name: "Pausa", slug: "pausa", lat: 19.4, lng: -99.1, status: "paused")

    travel_to open_moment do
    get "/public/shops"

    assert_response :success
    slugs = response.parsed_body["shops"].map { |shop| shop["slug"] }
    assert_includes slugs, "viva"
    assert_not_includes slugs, "borrador"
    assert_not_includes slugs, "pausa"
    end
  end

  test "lists every active shop through system scope and hides other tenants private data" do
    roma = create_shop(
      name: "Roma",
      slug: "roma",
      address: "Orizaba 1",
      lat: 19.42,
      lng: -99.16,
      stripe_account_id: "acct_roma_secret"
    )
    condesa = create_shop(
      name: "Condesa",
      slug: "condesa",
      address: "Tamaulipas 2",
      lat: 19.41,
      lng: -99.17,
      stripe_account_id: "acct_condesa_secret"
    )

    Current.shop = roma
    MenuItem.create!(shop: roma, name: "Secreto Roma", price_cents: 3200)
    assert_equal [ roma.id ], MenuItem.pluck(:shop_id)

    TenantScoped.unscoped_for_system do
      Current.shop = condesa
      MenuItem.create!(shop: condesa, name: "Secreto Condesa", price_cents: 900)
    end
    Current.shop = roma
    assert_equal [ "Secreto Roma" ], MenuItem.order(:name).pluck(:name)

    entered_system_scope = false
    original = TenantScoped.method(:unscoped_for_system)
    TenantScoped.define_singleton_method(:unscoped_for_system) do |&block|
      original.call do
        entered_system_scope = TenantScoped.system_access?
        block.call
      end
    end

    travel_to open_moment do
    get "/public/shops"

    assert_response :success
    assert entered_system_scope
    slugs = response.parsed_body["shops"].map { |shop| shop["slug"] }
    assert_includes slugs, roma.slug
    assert_includes slugs, condesa.slug
    assert_not_includes response.body, "Secreto Roma"
    assert_not_includes response.body, "Secreto Condesa"
    assert_not_includes response.body, "acct_roma_secret"
    assert_not_includes response.body, "acct_condesa_secret"
    assert_not_includes response.body, roma.id
    assert_not_includes response.body, condesa.id
    assert_not TenantScoped.system_access?
    end
  ensure
    TenantScoped.define_singleton_method(:unscoped_for_system, original) if original
  end

  test "directory hides test shops and closed shops unless closed shops are requested" do
    create_shop(name: "Cafe Serrano", slug: "cafe-serrano", address: "Calle Serrano 12, Madrid")
    create_shop(name: "Analytics Cafe", slug: "analytics-cafe", address: "Lab", test_shop: true)
    create_shop(name: "Cafe Noche", slug: "cafe-noche", operating_hours: closed_hours)

    travel_to open_moment do
      get "/public/shops"

      assert_response :success
      slugs = response.parsed_body["shops"].map { |shop| shop["slug"] }
      assert_equal [ "cafe-serrano" ], slugs
      assert_not_includes response.body, "Analytics Cafe"
      assert_not_includes response.body, "cafe-noche"

      get "/public/shops", params: { include_closed: "1" }

      assert_response :success
      with_closed = response.parsed_body["shops"].map { |shop| shop["slug"] }
      assert_equal [ "cafe-noche", "cafe-serrano" ], with_closed
      assert_not_includes with_closed, "analytics-cafe"
    end
  end

  test "public shop lookup used for discovery hides unpublished and test shops" do
    published = create_shop(name: "Cafe Publico", slug: "cafe-publico", address: "Madrid")
    hidden = create_shop(name: "Reorder Test", slug: "reorder-test", test_shop: true)
    draft = create_shop(name: "Borrador Publico", slug: "borrador-publico", status: "draft")
    closed = create_shop(name: "Cafe Cerrado Slug", slug: "cafe-cerrado-slug", operating_hours: closed_hours)

    get "/shops/#{published.slug}"
    assert_response :success
    assert_equal published.slug, response.parsed_body["shop"]["slug"]

    get "/shops/#{hidden.slug}"
    assert_response :not_found

    get "/shops/#{draft.slug}"
    assert_response :not_found

    get "/shops/#{closed.slug}"
    assert_response :success
    assert_equal closed.slug, response.parsed_body["shop"]["slug"]
  end

  test "directory does not leak another tenant and leaves the fail-closed scope in place" do
    open_shop = create_shop(name: "Abierta", slug: "abierta", address: "Serrano 1")
    test_shop = create_shop(name: "Q", slug: "q-test", address: "A", test_shop: true)

    Current.shop = test_shop
    MenuItem.create!(shop: test_shop, name: "Secreto Test", price_cents: 100)
    Current.shop = open_shop
    MenuItem.create!(shop: open_shop, name: "Secreto Abierta", price_cents: 200)
    Current.shop = nil

    travel_to open_moment do
      get "/public/shops"
    end

    assert_response :success
    slugs = response.parsed_body["shops"].map { |shop| shop["slug"] }
    assert_includes slugs, "abierta"
    assert_not_includes slugs, "q-test"
    assert_not_includes response.body, "Secreto Test"
    assert_not_includes response.body, "Secreto Abierta"
    assert_not TenantScoped.system_access?
    assert_raises(TenantScoped::MissingShop) { MenuItem.count }
  end

  test "an owner can save coordinates for their shop only" do
    owner = User.create!(email: "owner-explore@example.com", password: "password123")
    other = User.create!(email: "other-explore@example.com", password: "password123")
    shop = create_shop(name: "Mia", slug: "mia", owner: owner)
    foreign = create_shop(name: "Ajena", slug: "ajena", owner: other, lat: 19.1, lng: -99.2)
    ShopMember.create!(shop: shop, user: owner, role: :owner)
    ShopMember.create!(shop: foreign, user: other, role: :owner)
    headers = { "Authorization" => "Bearer #{JsonWebToken.encode(user_id: owner.id)}" }

    patch "/shops/#{shop.id}", params: { shop: { lat: 19.432608, lng: -99.133209 } }, headers: headers

    assert_response :success
    assert_in_delta 19.432608, shop.reload.lat.to_f, 0.000001
    assert_in_delta(-99.133209, shop.reload.lng.to_f, 0.000001)
    assert_in_delta 19.1, foreign.reload.lat.to_f, 0.000001
    assert_in_delta(-99.2, foreign.reload.lng.to_f, 0.000001)

    patch "/shops/#{foreign.id}", params: { shop: { lat: 1, lng: 1 } }, headers: headers

    assert_response :not_found
    assert_in_delta 19.1, foreign.reload.lat.to_f, 0.000001
  end

  test "rejects coordinates outside the valid range" do
    owner = User.create!(email: "owner-range@example.com", password: "password123")
    shop = create_shop(name: "Rango", slug: "rango", owner: owner, lat: 19.4, lng: -99.1)
    ShopMember.create!(shop: shop, user: owner, role: :owner)
    headers = { "Authorization" => "Bearer #{JsonWebToken.encode(user_id: owner.id)}" }

    patch "/shops/#{shop.id}", params: { shop: { lat: 120, lng: -99.1 } }, headers: headers

    assert_response :unprocessable_entity
    assert_in_delta 19.4, shop.reload.lat.to_f, 0.000001
    assert_in_delta(-99.1, shop.reload.lng.to_f, 0.000001)
  end

  private

  def create_shop(**attrs)
    Shop.create!({ currency: "MXN", status: "active", timezone: "America/Mexico_City" }.merge(attrs))
  end

  def closed_hours
    Shop::DAY_KEYS.index_with { { "is_open" => false } }
  end

  def open_moment
    Time.find_zone!("America/Mexico_City").local(2026, 10, 21, 12, 0, 0)
  end
end
