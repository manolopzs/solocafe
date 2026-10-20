require "test_helper"

class TenantIsolationTest < ActiveSupport::TestCase
  setup do
    @shop_a = Shop.create!(name: "Cafe A", slug: "iso-a-#{SecureRandom.hex(4)}", currency: "MXN")
    @shop_b = Shop.create!(name: "Cafe B", slug: "iso-b-#{SecureRandom.hex(4)}", currency: "MXN")
    @category_a = MenuCategory.create!(shop: @shop_a, name: "Drinks", sort_order: 1)
    @category_b = MenuCategory.create!(shop: @shop_b, name: "Drinks", sort_order: 1)
    @item_a = MenuItem.create!(shop: @shop_a, category: @category_a, name: "Latte A", price_cents: 100)
    @item_b = MenuItem.create!(shop: @shop_b, category: @category_b, name: "Latte B", price_cents: 200)
    @group_b = ModifierGroup.create!(shop: @shop_b, name: "Size", min_select: 0, max_select: 1)
    @customer_a = Customer.create!(name: "Ana", phone: "+521111111111")
    @customer_b = Customer.create!(name: "Bea", phone: "+522222222222")
    @order_a = create_order(@shop_a, @customer_a, 1000)
    @order_b = create_order(@shop_b, @customer_b, 2500)
  end

  teardown do
    Current.shop = nil
  end

  test "tenant queries raise when no shop is current" do
    Current.shop = nil

    assert_raises(TenantScoped::MissingShop) { MenuItem.count }
    assert_raises(TenantScoped::MissingShop) { Order.count }
    assert_raises(TenantScoped::MissingShop) { @customer_a.orders.load }
    assert_raises(TenantScoped::MissingShop) { Order.update_all(customer_name: "Stolen") }
    assert_raises(TenantScoped::MissingShop) { MenuItem.delete_all }
  end

  test "system block reads across shops and does not leak" do
    ids = TenantScoped.unscoped_for_system { Order.pluck(:id) }

    assert_includes ids, @order_a.id
    assert_includes ids, @order_b.id
    assert_raises(TenantScoped::MissingShop) { Order.count }
  end

  test "shop A cannot read shop B menu records" do
    Current.shop = @shop_a

    assert_equal [ @item_a.id ], MenuItem.pluck(:id)
    assert_raises(ActiveRecord::RecordNotFound) { MenuItem.find(@item_b.id) }
    assert_raises(ActiveRecord::RecordNotFound) { MenuCategory.find(@category_b.id) }
    assert_raises(ActiveRecord::RecordNotFound) { ModifierGroup.find(@group_b.id) }
  end

  test "shop A cannot write shop B menu records" do
    Current.shop = @shop_a

    assert_raises(ActiveRecord::RecordInvalid) do
      MenuItem.create!(shop: @shop_b, name: "Stolen", price_cents: 1)
    end

    @group_b.name = "Stolen"
    assert_raises(ActiveRecord::RecordInvalid) { @group_b.save! }

    @item_b.name = "Stolen"
    assert_raises(ActiveRecord::RecordInvalid) { @item_b.save! }

    stored = TenantScoped.unscoped_for_system { MenuItem.find(@item_b.id) }
    assert_equal "Latte B", stored.name
    assert_equal 0, TenantScoped.unscoped_for_system { MenuItem.where(name: "Stolen").count }
  end

  test "shop A cannot read shop B orders" do
    Current.shop = @shop_a

    assert_equal [ @order_a.id ], Order.pluck(:id)
    assert_raises(ActiveRecord::RecordNotFound) { Order.find(@order_b.id) }
  end

  test "shop A cannot write shop B orders" do
    Current.shop = @shop_a

    assert_raises(ActiveRecord::RecordInvalid) do
      create_order(@shop_b, @customer_b, 1)
    end

    @order_b.customer_name = "Stolen"
    assert_raises(ActiveRecord::RecordInvalid) { @order_b.save! }
    assert_equal 0, Order.where(id: @order_b.id).update_all(customer_name: "Stolen")

    stored = TenantScoped.unscoped_for_system { Order.find(@order_b.id) }
    assert_not_equal "Stolen", stored.customer_name
  end

  test "shop A cannot read another shops customers through orders" do
    Current.shop = @shop_a

    customer_ids = Customer.joins(:orders).distinct.pluck(:id)
    assert_includes customer_ids, @customer_a.id
    assert_not_includes customer_ids, @customer_b.id
    assert_raises(ActiveRecord::RecordNotFound) { @customer_b.orders.find(@order_b.id) }
  end

  test "shop A cannot write another shops customer order" do
    Current.shop = @shop_a

    assert_raises(ActiveRecord::RecordNotFound) { @customer_b.orders.find(@order_b.id) }
    assert_raises(ActiveRecord::RecordInvalid) { @order_b.update!(customer_name: "Stolen") }

    stored = TenantScoped.unscoped_for_system { Order.find(@order_b.id) }
    assert_not_equal "Stolen", stored.customer_name
  end

  test "shop A analytics totals exclude shop B orders" do
    Current.shop = @shop_a

    assert_equal 1, Order.count
    assert_equal 1000, Order.sum(:total_cents)

    assert_raises(ActiveRecord::RecordInvalid) do
      create_order(@shop_b, @customer_a, 9999)
    end

    assert_equal 1000, Order.sum(:total_cents)
    assert_equal 2500, TenantScoped.unscoped_for_system { Order.where(shop: @shop_b).sum(:total_cents) }
  end

  private

  def create_order(shop, customer, total_cents)
    Order.create!(
      shop: shop,
      customer: customer,
      customer_name: customer.name,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: total_cents,
      total_cents: total_cents,
      currency: "MXN",
      pickup_type: "asap"
    )
  end
end
