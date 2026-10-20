require "test_helper"
require "ostruct"

class SavedCardWithoutShopTest < ActiveSupport::TestCase
  setup do
    Current.shop = nil
    @owner = User.create!(email: "saved-card-owner@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe Norte", slug: "cafe-norte-cards", currency: "MXN", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe Sur", slug: "cafe-sur-cards", currency: "MXN", owner: @owner)
    @user = User.create!(email: "ana-cards@example.com", password: "password123", role: :customer)
    @customer = Customer.create!(user: @user, name: "Ana", phone: "5551212121")
    @other = Customer.create!(name: "Luis", phone: "5553434343", stripe_customer_id: "cus_luis")
    @order = Order.create!(
      shop: @shop,
      customer: @customer,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 500,
      total_cents: 500,
      currency: "MXN",
      pickup_type: "asap"
    )
  end

  teardown do
    Current.shop = nil
  end

  test "platform stripe customer is created for that customer when no shop is current" do
    assert_nil Current.shop

    created = with_platform_customer("cus_new") { @customer.ensure_platform_stripe_customer! }

    assert_equal "cus_new", created
    assert_equal "cus_new", @customer.reload.stripe_customer_id
    assert_equal "cus_luis", @other.reload.stripe_customer_id
    assert_equal [ { customer_id: @customer.id } ], created_metadata
    assert_equal false, TenantScoped.system_access?
    assert_raises(TenantScoped::MissingShop) { Order.count }
  end

  test "platform stripe customer lookup does not call stripe again" do
    @customer.update!(stripe_customer_id: "cus_existing")

    calls = with_platform_customer("cus_should_not_be_used") { @customer.ensure_platform_stripe_customer! }

    assert_equal "cus_existing", calls
    assert_empty @created_customers
  end

  test "card storage update and customer lookup work when no shop is current" do
    assert_nil Current.shop
    CustomerPaymentMethod.store_attached!(card_payload("pm_ana", "cus_ana_missing"))
    assert_equal 0, CustomerPaymentMethod.count

    @customer.update!(stripe_customer_id: "cus_ana")
    CustomerPaymentMethod.store_attached!(card_payload("pm_ana", "cus_ana"))
    saved = CustomerPaymentMethod.find_by!(stripe_payment_method_id: "pm_ana")
    assert_equal @customer.id, saved.customer_id
    assert_equal "4242", saved.last4
    assert_equal 0, CustomerPaymentMethod.where(customer: @other).count

    CustomerPaymentMethod.apply_card_update!(card_payload("pm_ana", "cus_luis", last4: "1111", exp_month: 3, exp_year: 2032))
    saved.reload
    assert_equal @customer.id, saved.customer_id
    assert_equal "1111", saved.last4
    assert_equal 3, saved.exp_month
    assert_equal 2032, saved.exp_year

    found = TenantScoped.unscoped_for_system do
      CustomerPaymentMethod.for_customer(@customer).find_by(id: saved.id)
    end
    hidden = TenantScoped.unscoped_for_system do
      CustomerPaymentMethod.for_customer(@other).find_by(id: saved.id)
    end
    assert_equal saved.id, found.id
    assert_nil hidden
    assert_equal false, TenantScoped.system_access?
    assert_raises(TenantScoped::MissingShop) { Order.find(@order.id) }
  end

  test "card storage stays on the customer when another shop is current" do
    @customer.update!(stripe_customer_id: "cus_ana")
    Current.shop = @other_shop

    CustomerPaymentMethod.store_for_customer!(@customer, card_payload("pm_ana", "cus_ana"))

    assert_nil Order.find_by(id: @order.id)
    saved = TenantScoped.unscoped_for_system do
      CustomerPaymentMethod.for_customer(@customer).find_by!(stripe_payment_method_id: "pm_ana")
    end
    assert_equal @customer.id, saved.customer_id
    assert_equal 0, CustomerPaymentMethod.where(customer: @other).count
  end

  private

  def created_metadata
    @created_customers.map do |attrs|
      metadata = attrs[:metadata] || attrs["metadata"]
      { customer_id: metadata[:customer_id] || metadata["customer_id"] }
    end
  end

  def with_platform_customer(stripe_id)
    @created_customers = []
    original = Stripe::Customer.method(:create)
    created = @created_customers
    Stripe::Customer.define_singleton_method(:create) do |*args|
      attrs = args.last.is_a?(Hash) ? args.last : {}
      created << attrs
      OpenStruct.new(id: stripe_id)
    end
    yield
  ensure
    Stripe::Customer.define_singleton_method(:create, original)
  end

  def card_payload(id, customer_id, last4: "4242", exp_month: 12, exp_year: 2030)
    OpenStruct.new(
      id: id,
      type: "card",
      customer: customer_id,
      card: OpenStruct.new(brand: "visa", last4: last4, exp_month: exp_month, exp_year: exp_year)
    )
  end
end
