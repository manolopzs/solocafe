require "test_helper"
require "ostruct"

class ShopOnboardingTest < ActiveSupport::TestCase
  setup do
    Current.reset
    @owner = User.create!(email: "onboarding-owner@example.com", password: "password123")
    @shop = Shop.create!(
      name: "Cafe Norte",
      slug: "cafe-norte",
      currency: "MXN",
      status: "draft",
      owner: @owner
    )
    @other = Shop.create!(
      name: "Cafe Sur",
      slug: "cafe-sur",
      currency: "MXN",
      status: "draft",
      stripe_account_id: "acct_other",
      stripe_connect_status: "pending",
      owner: @owner
    )
  end

  test "a new draft shop is not ready to go live" do
    snapshot = ShopOnboarding.snapshot(@shop)

    assert_equal "draft", snapshot[:status]
    assert_equal false, snapshot[:live]
    assert_equal false, snapshot[:can_go_live]
    assert_equal false, snapshot[:hours_confirmed]
    assert_equal %w[menu stripe hours], snapshot[:blockers]
    assert_equal "not_started", snapshot[:stripe][:status]
    assert_equal false, snapshot[:steps].find { |step| step[:key] == "live" }[:done]
  end

  test "go live stays draft until menu stripe and hours are ready" do
    assert_raises(ShopOnboarding::NotReady) { ShopOnboarding.go_live!(@shop) }
    assert_equal "draft", @shop.reload.status
  end

  test "go live publishes a ready draft and leaves an already live shop alone" do
    prepare_for_launch!(@shop)

    snapshot = ShopOnboarding.go_live!(@shop)
    assert_equal "active", @shop.reload.status
    assert_equal true, snapshot[:live]
    assert_equal [], snapshot[:blockers]

    @shop.menu_items.delete_all
    again = ShopOnboarding.go_live!(@shop.reload)
    assert_equal "active", @shop.reload.status
    assert_equal true, again[:live]
  end

  test "stripe account fields map to pending restricted or active" do
    ShopOnboarding.apply_stripe_account!(@shop, account("acct_new", charges_enabled: false, details_submitted: false))
    assert_equal "pending", @shop.reload.stripe_connect_status

    ShopOnboarding.apply_stripe_account!(@shop, account("acct_new", charges_enabled: false, details_submitted: true))
    assert_equal "restricted", @shop.reload.stripe_connect_status
    assert_equal "restricted", ShopOnboarding.snapshot(@shop)[:stripe][:status]
    assert_equal false, ShopOnboarding.snapshot(@shop)[:stripe][:charges_enabled]

    ShopOnboarding.apply_stripe_account!(@shop, account("acct_new", charges_enabled: true, details_submitted: true))
    assert_equal "active", @shop.reload.stripe_connect_status
    assert_equal "draft", @shop.status
    assert_equal "pending", @other.reload.stripe_connect_status
  end

  test "starter menu is idempotent and stays inside the shop" do
    assert_equal true, ShopOnboarding.seed_starter_menu!(@shop)
    count = MenuItem.unscoped.where(shop_id: @shop.id).count
    assert count >= 5
    assert_equal 0, MenuItem.unscoped.where(shop_id: @other.id).count

    assert_equal false, ShopOnboarding.seed_starter_menu!(@shop)
    assert_equal count, MenuItem.unscoped.where(shop_id: @shop.id).count
    assert_not_includes ShopOnboarding.snapshot(@shop.reload)[:blockers], "menu"
  end

  test "slug is generated from the name and avoids collisions" do
    assert_equal "cafe-centro", ShopOnboarding.unique_slug("Café Centro")
    assert_equal "cafe-norte-2", ShopOnboarding.unique_slug("Cafe Norte")
    assert_equal "mi-barra", ShopOnboarding.unique_slug("Otro", "mi-barra")
  end

  private

  def prepare_for_launch!(shop)
    MenuItem.create!(shop: shop, name: "Americano", price_cents: 4200, is_active: true)
    shop.update!(
      stripe_account_id: "acct_ready",
      stripe_connect_status: "active",
      operating_hours: {
        "mon" => { "is_open" => true, "open" => "08:00", "close" => "18:00" }
      }
    )
  end

  def account(id, charges_enabled:, details_submitted:)
    OpenStruct.new(id: id, charges_enabled: charges_enabled, details_submitted: details_submitted)
  end
end
