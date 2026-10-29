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

  test "system lookup reads an order when no shop is current and does not leak" do
    Current.shop = nil

    found = TenantScoped.unscoped_for_system { Order.find_by(id: @order.id) }

    assert_equal @order.id, found.id
    assert_equal false, TenantScoped.system_access?
  end

  test "system lookup reads an order hidden from the current shop" do
    Current.shop = @other_shop

    assert_nil Order.find_by(id: @order.id)
    assert_equal @order.id, TenantScoped.unscoped_for_system { Order.find_by(id: @order.id) }.id
    assert_nil Order.find_by(id: @order.id)
  ensure
    Current.shop = nil
  end

  test "saved card lookups do not leak across shops" do
    ana = Customer.create!(name: "Ana", phone: "5553333333", stripe_customer_id: "cus_ana")
    luis = Customer.create!(name: "Luis", phone: "5554444444", stripe_customer_id: "cus_luis")
    ana_card = CustomerPaymentMethod.create!(
      customer: ana,
      stripe_payment_method_id: "pm_ana",
      brand: "visa",
      last4: "4242",
      exp_month: 4,
      exp_year: 2030
    )
    luis_card = CustomerPaymentMethod.create!(
      customer: luis,
      stripe_payment_method_id: "pm_luis",
      brand: "mastercard",
      last4: "4444",
      exp_month: 8,
      exp_year: 2031
    )
    Order.create!(
      shop: @other_shop,
      customer: luis,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 700,
      total_cents: 700,
      currency: "MXN",
      pickup_type: "asap"
    )

    Current.shop = @shop
    assert_equal [ ana_card.id ], saved_card_ids_for(ana)
    assert_equal [ luis_card.id ], saved_card_ids_for(luis)
    assert_not_includes saved_card_ids_for(ana), luis_card.id

    Current.shop = @other_shop
    assert_equal [ ana_card.id ], saved_card_ids_for(ana)
    assert_equal [ luis_card.id ], saved_card_ids_for(luis)
    assert_nil Order.find_by(id: @order.id)

    Current.shop = nil
    assert_equal [ ana_card.id ], saved_card_ids_for(ana)
    assert_equal [ "pm_ana" ], CustomerPaymentMethod.where(customer: ana).pluck(:stripe_payment_method_id)
    assert_equal false, TenantScoped.system_access?
    assert_not_includes CustomerPaymentMethod.column_names, "shop_id"
  ensure
    Current.shop = nil
  end

  private

  def saved_card_ids_for(customer)
    TenantScoped.unscoped_for_system do
      CustomerPaymentMethod.for_customer(customer).pluck(:id)
    end
  end
end
