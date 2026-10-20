require "test_helper"

class TenantScopedTest < ActiveSupport::TestCase
  setup do
    @owner = User.create!(email: "tenant-owner@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe A", slug: "cafe-tenant-a", currency: "MXN", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe B", slug: "cafe-tenant-b", currency: "MXN", owner: @owner)
    @order = Order.create!(
      shop: @shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 500,
      total_cents: 500,
      currency: "MXN",
      pickup_type: "asap"
    )
  end

  test "guest access token finds the order when another shop is current" do
    Current.shop = @other_shop

    found = Order.locate_by_guest_access_token(@order.guest_access_token)

    assert_equal @order.id, found.id
  ensure
    Current.shop = nil
  end

  test "across_shops reads an order when no shop is current" do
    Current.shop = nil

    assert_equal @order.id, Order.across_shops.find_by(id: @order.id).id
  end

  test "across_shops reads an order hidden from the current shop" do
    Current.shop = @other_shop

    assert_nil Order.find_by(id: @order.id)
    assert_equal @order.id, Order.across_shops.find_by(id: @order.id).id
  ensure
    Current.shop = nil
  end

  test "saved cards stay on the customer when another shop is current" do
    customer = Customer.create!(name: "Ana", phone: "5553333333")
    card = CustomerPaymentMethod.create!(
      customer: customer,
      stripe_payment_method_id: "pm_cross_shop",
      brand: "visa",
      last4: "4242",
      exp_month: 4,
      exp_year: 2030
    )
    Current.shop = @other_shop

    assert_equal [ card.id ], CustomerPaymentMethod.for_customer(customer).pluck(:id)
    assert_not_includes CustomerPaymentMethod.column_names, "shop_id"
  ensure
    Current.shop = nil
  end
end