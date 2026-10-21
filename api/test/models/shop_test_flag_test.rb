require "test_helper"
require "rake"

class ShopTestFlagTest < ActiveSupport::TestCase
  setup do
    Api::Application.load_tasks unless Rake::Task.task_defined?("shops:flag_test_shops")
  end

  test "flags obvious test names and addresses without deleting shops" do
    analytics = shop(name: "Analytics Cafe", slug: "analytics-cafe", address: "Campus")
    reorder = shop(name: "Reorder Test", slug: "reorder-test", address: "Madrid")
    letter = shop(name: "Q", slug: "q", address: "Serrano 1")
    address_test = shop(name: "Bar Real", slug: "bar-real", address: "Test")
    address_a = shop(name: "Bar Norte", slug: "bar-norte", address: "A")
    real = shop(name: "Cafe Recoletos", slug: "cafe-recoletos", address: "Calle Serrano 12")
    spaced = shop(name: "  analytics   cafe  ", slug: "analytics-spaced", address: "Lab")
    phrase = shop(name: "Reorder Test 2", slug: "reorder-test-2", address: "Lab 2")
    almost = shop(name: "AB", slug: "ab", address: "Test Street")
    before_count = Shop.count

    lines = Shop.flag_obvious_test_shops!(dry_run: false)

    assert_equal before_count, Shop.count
    assert analytics.reload.test_shop
    assert reorder.reload.test_shop
    assert letter.reload.test_shop
    assert address_test.reload.test_shop
    assert address_a.reload.test_shop
    assert spaced.reload.test_shop
    assert phrase.reload.test_shop
    assert_not real.reload.test_shop
    assert_not almost.reload.test_shop
    assert_includes lines.join("\n"), "flagged"
    assert_not_includes lines.join("\n"), real.id

    again = Shop.flag_obvious_test_shops!(dry_run: false)

    assert analytics.reload.test_shop
    assert_equal before_count, Shop.count
    assert again.any? { |line| line.start_with?("already_flagged ") }
    assert again.none? { |line| line.start_with?("flagged ") }
  end

  test "DRY_RUN=1 lists matches and does not write" do
    match = shop(name: "Analytics Cafe", slug: "analytics-dry", address: "Test")
    ENV["DRY_RUN"] = "1"
    output = nil

    output, = capture_io do
      Rake::Task["shops:flag_test_shops"].reenable
      Rake::Task["shops:flag_test_shops"].invoke
    end

    assert_includes output, match.name
    assert_not match.reload.test_shop
    assert_equal 1, Shop.where(id: match.id).count
  ensure
    ENV.delete("DRY_RUN")
  end

  test "refuses to run in production and does not change rows" do
    match = shop(name: "Reorder Test", slug: "reorder-prod", address: "A")

    assert_raises(Shop::TestShopFlagRefused) do
      Shop.flag_obvious_test_shops!(dry_run: false, environment: ActiveSupport::EnvironmentInquirer.new("production"))
    end

    assert_not match.reload.test_shop
    assert Shop.exists?(match.id)
  end

  test "does not need a current shop under fail-closed tenant scope" do
    match = shop(name: "Analytics Cafe", slug: "analytics-tenant", address: "Madrid")
    Current.shop = nil

    assert_raises(TenantScoped::MissingShop) { MenuItem.count }

    lines = Shop.flag_obvious_test_shops!(dry_run: false)

    assert match.reload.test_shop
    assert_includes lines.join("\n"), match.id
    assert_not TenantScoped.system_access?
    assert_raises(TenantScoped::MissingShop) { MenuItem.count }
  end

  private

  def shop(**attrs)
    Shop.create!({ currency: "EUR", status: "active", timezone: "Europe/Madrid" }.merge(attrs))
  end
end
