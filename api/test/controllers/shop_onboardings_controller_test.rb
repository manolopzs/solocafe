require "test_helper"
require "ostruct"

class ShopOnboardingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner-onb@example.com", password: "password123")
    @other = User.create!(email: "other-onb@example.com", password: "password123")
    @tier = SubscriptionTier.create!(
      name: "Free",
      monthly_price_cents: 0,
      included_orders: 100,
      overage_per_order_cents: 0,
      is_active: true
    )
    @shop = Shop.create!(
      name: "Cafe Draft",
      slug: "cafe-draft",
      currency: "MXN",
      status: "draft",
      owner: @owner
    )
    @live = Shop.create!(
      name: "Cafe Live",
      slug: "cafe-live",
      currency: "MXN",
      status: "active",
      owner: @owner
    )
    ShopMember.create!(shop: @shop, user: @owner, role: :owner)
    ShopMember.create!(shop: @live, user: @owner, role: :owner)
    @token = JsonWebToken.encode(user_id: @owner.id)
    @other_token = JsonWebToken.encode(user_id: @other.id)
  end

  test "creating a shop keeps it unpublished and can seed a starter menu" do
    post "/shops",
      params: { shop: { name: "Cafe Norte" }, seed_starter_menu: true },
      headers: auth(@token),
      as: :json

    assert_response :created
    body = response.parsed_body
    shop = Shop.find(body["shop"]["id"])
    assert_equal "draft", shop.status
    assert_equal "cafe-norte", shop.slug
    assert shop.read_attribute(:operating_hours).blank?
    assert_equal false, body["shop"]["onboarding"]["live"]
    assert_equal false, body["shop"]["onboarding"]["hours_confirmed"]
    assert_equal "not_started", body["shop"]["onboarding"]["stripe"]["status"]
    assert_not_includes body["shop"]["onboarding"]["blockers"], "menu"
    assert TenantScoped.unscoped_for_system { MenuItem.where(shop_id: shop.id).exists? }
    assert_equal 0, TenantScoped.unscoped_for_system { MenuItem.where(shop_id: @shop.id).count }

    get "/shops/cafe-norte"
    assert_response :not_found
  end

  test "another tenant cannot read or publish a draft shop" do
    get "/shops/#{@shop.id}/onboarding", headers: auth(@other_token)
    assert_response :not_found

    post "/shops/#{@shop.id}/onboarding/go_live", headers: auth(@other_token), as: :json
    assert_response :not_found
    assert_equal "draft", @shop.reload.status

    get "/shops/#{@shop.id}/menu_items", headers: auth(@other_token)
    assert_response :not_found

    patch "/shops/#{@shop.id}",
      params: { shop: { name: "Robada" } },
      headers: auth(@other_token),
      as: :json
    assert_response :not_found
    assert_equal "Cafe Draft", @shop.reload.name
  end

  test "the owner can load a draft menu and an active menu stays visible to other users" do
    MenuItem.create!(shop: @shop, name: "Americano", price_cents: 4200)
    MenuItem.create!(shop: @live, name: "Latte", price_cents: 5000)

    get "/shops/#{@shop.id}/onboarding", headers: auth(@token)
    assert_response :success
    assert_equal false, response.parsed_body["onboarding"]["live"]

    get "/shops/#{@shop.id}/menu_items", headers: auth(@token)
    assert_response :success
    assert_equal [ "Americano" ], response.parsed_body["items"].map { |item| item["name"] }

    get "/shops/#{@live.id}/menu_items", headers: auth(@other_token)
    assert_response :success
    assert_equal [ "Latte" ], response.parsed_body["items"].map { |item| item["name"] }
  end

  test "saving hours is tenant scoped and rejects a close before open" do
    patch "/shops/#{@shop.id}",
      params: {
        shop: {
          operating_hours: {
            mon: { is_open: true, open: "18:00", close: "08:00" }
          }
        }
      },
      headers: auth(@token),
      as: :json

    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"].join(" "), "hours_invalid"
    assert @shop.reload.read_attribute(:operating_hours).blank?

    patch "/shops/#{@shop.id}",
      params: {
        shop: {
          operating_hours: {
            mon: { is_open: true, open: "08:00", close: "18:00" },
            sun: { is_open: false }
          }
        }
      },
      headers: auth(@token),
      as: :json

    assert_response :success
    assert_equal "08:00", @shop.reload.operating_hours["mon"]["open"]
    assert_equal true, response.parsed_body["shop"]["onboarding"]["hours_confirmed"]
  end

  test "go live publishes only when blockers are clear and then the public page exists" do
    post "/shops/#{@shop.id}/onboarding/go_live", headers: auth(@token), as: :json
    assert_response :unprocessable_entity
    assert_equal "not_ready", response.parsed_body["error"]
    assert_equal "draft", @shop.reload.status
    assert_includes response.parsed_body["onboarding"]["blockers"], "stripe"

    MenuItem.create!(shop: @shop, name: "Americano", price_cents: 4200, is_active: true)
    @shop.update!(
      stripe_account_id: "acct_ready",
      stripe_connect_status: "active",
      operating_hours: { "mon" => { "is_open" => true, "open" => "08:00", "close" => "18:00" } }
    )

    post "/shops/#{@shop.id}/onboarding/go_live", headers: auth(@token), as: :json
    assert_response :success
    assert_equal true, response.parsed_body["onboarding"]["live"]
    assert_equal "active", @shop.reload.status

    get "/shops/cafe-draft"
    assert_response :success
  end

  test "a draft shop cannot take orders" do
    post "/shops/#{@shop.id}/orders",
      params: { order: { pickup_type: "asap", items: [] } },
      as: :json

    assert_response :not_found
    Current.shop = @shop
    assert_equal 0, Order.where(shop_id: @shop.id).count
  end

  test "stripe status sync updates only the member shop" do
    @shop.update!(stripe_account_id: "acct_sync", stripe_connect_status: "pending")
    @live.update!(stripe_account_id: "acct_live", stripe_connect_status: "pending")

    with_account(OpenStruct.new(id: "acct_sync", charges_enabled: true, details_submitted: true)) do
      post "/shops/#{@shop.id}/stripe/status", headers: auth(@token), as: :json
    end

    assert_response :success
    assert_equal "active", @shop.reload.stripe_connect_status
    assert_equal "active", response.parsed_body["onboarding"]["stripe"]["status"]
    assert_equal true, response.parsed_body["onboarding"]["stripe"]["charges_enabled"]
    assert_equal "pending", @live.reload.stripe_connect_status
    assert_equal "draft", @shop.status

    with_account(OpenStruct.new(id: "acct_sync", charges_enabled: true, details_submitted: true)) do
      post "/shops/#{@shop.id}/stripe/status", headers: auth(@other_token), as: :json
    end
    assert_response :not_found
  end

  test "connect refreshes an existing account and skips a new link when charges are enabled" do
    @shop.update!(stripe_account_id: "acct_sync", stripe_connect_status: "pending")

    with_account(OpenStruct.new(id: "acct_sync", charges_enabled: true, details_submitted: true)) do
      post "/shops/#{@shop.id}/stripe/connect", headers: auth(@token), as: :json
    end

    assert_response :success
    assert_nil response.parsed_body["url"]
    assert_equal "active", @shop.reload.stripe_connect_status
  end

  private

  def auth(token)
    { "Authorization" => "Bearer #{token}" }
  end

  def with_account(account)
    retrieve = Stripe::Account.method(:retrieve)
    link = Stripe::AccountLink.method(:create)
    Stripe::Account.define_singleton_method(:retrieve) { |*| account }
    Stripe::AccountLink.define_singleton_method(:create) { |*| raise "account link should not be created" }
    yield
  ensure
    Stripe::Account.define_singleton_method(:retrieve, retrieve)
    Stripe::AccountLink.define_singleton_method(:create, link)
  end
end
