require "test_helper"

class MenuItemTest < ActiveSupport::TestCase
  setup do
    @owner = User.create!(email: "menu-item-owner@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe A", slug: "cafe-menu-a", currency: "EUR", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe B", slug: "cafe-menu-b", currency: "EUR", owner: @owner)
  end

  test "accepts valid allergen codes and normalizes them" do
    item = MenuItem.new(
      shop: @shop,
      name: "Croissant",
      price_cents: 250,
      allergens: %w[gluten milk eggs],
      may_contain_traces: true
    )

    assert item.valid?
    assert_equal %w[eggs gluten milk], item.allergens
    assert item.may_contain_traces
  end

  test "rejects invalid allergen codes" do
    item = MenuItem.new(
      shop: @shop,
      name: "Tarta",
      price_cents: 400,
      allergens: %w[gluten peanuts unknown]
    )

    assert_not item.valid?
    assert_includes item.errors[:allergens], "contiene códigos no válidos: unknown"
  end

  test "defaults allergens to empty array and may_contain_traces to false" do
    item = MenuItem.create!(shop: @shop, name: "Agua", price_cents: 100)

    assert_equal [], item.allergens
    assert_not item.may_contain_traces
  end

  test "strips blank allergens before validating" do
    item = MenuItem.new(
      shop: @shop,
      name: "Bollo",
      price_cents: 200,
      allergens: ["", "gluten", ""]
    )

    assert item.valid?
    assert_equal %w[gluten], item.allergens
  end

  test "tenant scoping still isolates menu items" do
    Current.shop = @shop
    item = MenuItem.create!(shop: @shop, name: "Local", price_cents: 100)

    assert_equal [item.id], MenuItem.pluck(:id)

    Current.shop = @other_shop
    assert_nil MenuItem.find_by(id: item.id)
  ensure
    Current.shop = nil
  end
end
