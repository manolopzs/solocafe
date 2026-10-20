require "test_helper"
require "ostruct"

class PaymentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner-a@example.com", password: "password123")
    @other_owner = User.create!(email: "owner-b@example.com", password: "password123")
    @shop = Shop.create!(
      name: "Cafe A",
      slug: "cafe-a",
      currency: "MXN",
      stripe_account_id: "acct_a",
      owner: @owner
    )
    @other_shop = Shop.create!(
      name: "Cafe B",
      slug: "cafe-b",
      currency: "MXN",
      stripe_account_id: "acct_b",
      owner: @other_owner
    )
    ShopMember.create!(shop: @shop, user: @owner, role: :owner)
    ShopMember.create!(shop: @other_shop, user: @other_owner, role: :owner)

    @order = Order.create!(
      shop: @shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1800,
      total_cents: 1800,
      currency: "MXN",
      pickup_type: "asap",
      customer_phone: "5551111111"
    )
    @other_token = JsonWebToken.encode(user_id: @other_owner.id)
    @stripe_calls = { create: [], update: [] }
  end

  test "customer phone can start a payment for a pending order" do
    with_stripe do
      post payments_url, params: { order_id: @order.id, customer_phone: "5551111111", amount_cents: 1 }
    end

    assert_response :success
    assert_equal "secret_test", response.parsed_body["client_secret"]
    payment = @order.reload.payment
    assert_equal 1800, payment.amount_cents
    assert_equal "pi_new", payment.stripe_payment_intent_id
    assert_equal [ 1800 ], @stripe_calls[:create].map { |args| args[0][:amount] }
    assert_empty @stripe_calls[:update]
  end

  test "rejects a payment without proof of the order" do
    with_stripe do
      post payments_url, params: { order_id: @order.id }
    end

    assert_response :unauthorized
    assert_nil @order.reload.payment
    assert_empty @stripe_calls[:create]
    assert_empty @stripe_calls[:update]
  end

  test "shop member of another tenant cannot pay this order" do
    with_stripe do
      post payments_url,
        params: { order_id: @order.id, customer_phone: "5559999999" },
        headers: { "Authorization" => "Bearer #{@other_token}" }
    end

    assert_response :unauthorized
    assert_nil @order.reload.payment
    assert_equal 0, Payment.joins(:order).where(orders: { shop_id: @other_shop.id }).count
    assert_empty @stripe_calls[:create]
    assert_empty @stripe_calls[:update]
  end

  test "does not update the amount of an already paid order" do
    @order.update!(status: "received", payment_status: "succeeded")
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "succeeded",
      stripe_payment_intent_id: "pi_paid"
    )

    with_stripe do
      post payments_url, params: { order_id: @order.id, customer_phone: "5551111111", amount_cents: 1 }
    end

    assert_response :unprocessable_entity
    assert_equal 1800, @order.reload.payment.amount_cents
    assert_equal "succeeded", @order.payment.status
    assert_empty @stripe_calls[:create]
    assert_empty @stripe_calls[:update]
  end

  test "does not refresh a payment for a cancelled order" do
    @order.update!(status: "cancelled")

    with_stripe do
      post payments_url, params: { order_id: @order.id, customer_phone: "5551111111" }
    end

    assert_response :unprocessable_entity
    assert_nil @order.reload.payment
    assert_empty @stripe_calls[:update]
  end

  test "reuses the pending payment intent without taking a client amount" do
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "pending",
      stripe_payment_intent_id: "pi_existing"
    )

    with_stripe do
      post payments_url, params: { order_id: @order.id, customer_phone: "5551111111", amount_cents: 50 }
    end

    assert_response :success
    assert_equal [ [ "pi_existing", 1800 ] ], @stripe_calls[:update].map { |args| [ args[0], args[1][:amount] ] }
    assert_equal 1, Payment.where(order: @order).count
  end

  private

  def with_stripe
    intent = OpenStruct.new(id: "pi_new", client_secret: "secret_test", status: "requires_payment_method")
    original_create = Stripe::PaymentIntent.method(:create)
    original_update = Stripe::PaymentIntent.method(:update)
    calls = @stripe_calls
    Stripe::PaymentIntent.define_singleton_method(:create) do |*args|
      calls[:create] << args
      intent
    end
    Stripe::PaymentIntent.define_singleton_method(:update) do |*args|
      calls[:update] << args
      intent
    end
    yield
  ensure
    Stripe::PaymentIntent.define_singleton_method(:create, original_create)
    Stripe::PaymentIntent.define_singleton_method(:update, original_update)
  end
end
