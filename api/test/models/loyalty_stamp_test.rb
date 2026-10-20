require "test_helper"

class LoyaltyStampTest < ActiveSupport::TestCase
  setup do
    @owner = User.create!(email: "loyalty-owner@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe Lealtad", slug: "cafe-lealtad", currency: "MXN", owner: @owner)
    @other = Shop.create!(name: "Cafe Ajena", slug: "cafe-ajena", currency: "MXN", owner: @owner)
    @user = User.create!(email: "loyalty-customer@example.com", password: "password123")
    @customer = Customer.create!(user: @user, name: "Ana", phone: "5551110000")
    @shop.update!(loyalty_stamps_required: 2, loyalty_reward_text: "Un café gratis")
  end

  teardown do
    Current.shop = nil
  end

  test "a paid order earns one stamp for that customer at that shop" do
    order = pending_order(@shop)

    order.apply_successful_payment!

    assert_equal "received", order.status
    assert_equal 1, earned_count(@shop, @customer)
    assert_equal 0, earned_count(@other, @customer)
  end

  test "repeating a successful payment does not earn another stamp" do
    order = pending_order(@shop)

    order.apply_successful_payment!
    order.apply_successful_payment!

    assert_equal 1, earned_count(@shop, @customer)
  end

  test "a guest payment does not earn a stamp" do
    order = pending_order(@shop, customer: nil)

    order.apply_successful_payment!

    assert_equal "received", order.status
    assert_equal 0, stamp_count(@shop)
  end

  test "cancelling a paid order removes its stamp" do
    order = pending_order(@shop)
    order.apply_successful_payment!

    Current.shop = @shop
    order.update!(status: "cancelled")
    LoyaltyStamp.unwind!(order)

    assert_equal 0, earned_count(@shop, @customer)
    assert_equal 1, reversed_count(@shop, @customer)
  end

  test "refunding a paid order removes its stamp once" do
    order = pending_order(@shop)
    order.apply_successful_payment!

    order.apply_refund!
    order.apply_refund!

    assert_equal "refunded", order.payment_status
    assert_equal 0, earned_count(@shop, @customer)
    assert_equal 1, reversed_count(@shop, @customer)
  end

  test "stamps from another shop are invisible and cannot be redeemed here" do
    2.times { pay_order(@shop) }

    assert_equal 2, earned_count(@shop, @customer)
    Current.shop = @other
    assert_equal 0, LoyaltyStamp.count
    assert_raises(LoyaltyStamp::Unavailable) { LoyaltyStamp.reserve!(pending_order(@other), @customer) }

    Current.shop = nil
    assert_raises(TenantScoped::MissingShop) { LoyaltyStamp.count }
  end

  test "redemption discounts the cheapest item and spends the configured stamps" do
    2.times { pay_order(@shop) }
    order = pending_order(@shop)
    cookie = line("Galleta", 2_000, 2)
    latte = line("Latte", 5_000, 1)

    LoyaltyStamp.redeem!(order, @customer, [ cookie, latte ])
    order.apply_successful_payment!

    assert_equal 2_000, order.discount_cents
    assert_equal 9_000, order.subtotal_cents
    assert_equal 7_000, order.total_cents
    assert_equal true, order.loyalty_redeemed
    assert_equal 1, earned_count(@shop, @customer)
    assert_equal 2, redeemed_count(@shop, @customer)
  end

  test "a client supplied discount is ignored when the card cannot be redeemed" do
    order = pending_order(@shop)
    order.discount_cents = 9_000

    assert_raises(LoyaltyStamp::Unavailable) do
      LoyaltyStamp.redeem!(order, @customer, [ line("Latte", 5_000, 1) ])
    end
    assert_equal 0, order.discount_cents
    assert_equal 0, redeemed_count(@shop, @customer)
  end

  test "a failed payment releases stamps reserved for redemption" do
    2.times { pay_order(@shop) }
    order = pending_order(@shop)
    LoyaltyStamp.redeem!(order, @customer, [ line("Latte", 4_000, 1) ])
    assert_equal 0, earned_count(@shop, @customer)

    order.apply_failed_payment!

    assert_equal "cancelled", order.status
    assert_equal 2, earned_count(@shop, @customer)
    assert_equal false, order.reload.loyalty_redeemed
  end

  test "refunding a redeemed order returns the spent stamps and removes the new one" do
    2.times { pay_order(@shop) }
    order = pending_order(@shop)
    LoyaltyStamp.redeem!(order, @customer, [ line("Latte", 4_000, 1) ])
    order.apply_successful_payment!
    assert_equal 1, earned_count(@shop, @customer)

    order.apply_refund!

    assert_equal 2, earned_count(@shop, @customer)
    assert_equal 0, redeemed_count(@shop, @customer)
  end

  private

  def pending_order(shop, customer: @customer)
    Order.create!(
      shop: shop,
      customer: customer,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1_000,
      total_cents: 1_000,
      currency: "MXN",
      pickup_type: "asap"
    )
  end

  def pay_order(shop)
    order = pending_order(shop)
    order.apply_successful_payment!
    order
  end

  def line(name, unit_price_cents, quantity)
    OrderPricing::Line.new(
      unit_price_cents: unit_price_cents,
      quantity: quantity,
      subtotal_cents: unit_price_cents * quantity
    ).tap { |priced| priced.define_singleton_method(:name) { name } }
  end

  def earned_count(shop, customer)
    Current.shop = shop
    LoyaltyStamp.where(customer: customer, status: "earned").count
  end

  def reversed_count(shop, customer)
    Current.shop = shop
    LoyaltyStamp.where(customer: customer, status: "reversed").count
  end

  def redeemed_count(shop, customer)
    Current.shop = shop
    LoyaltyStamp.where(customer: customer, status: "redeemed").count
  end

  def stamp_count(shop)
    Current.shop = shop
    LoyaltyStamp.count
  end
end
