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

  test "guest access token can start a payment for a pending order" do
    with_stripe do
      post payments_url, params: { order_id: @order.id, token: @order.guest_access_token, amount_cents: 1 }
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
      post payments_url, params: { order_id: @order.id, customer_phone: "5551111111" }
    end

    assert_response :unauthorized
    assert_nil @order.reload.payment
    assert_empty @stripe_calls[:create]
    assert_empty @stripe_calls[:update]
  end

  test "shop member of another tenant cannot pay this order" do
    with_stripe do
      post payments_url,
        params: { order_id: @order.id, token: "not-a-real-token" },
        headers: { "Authorization" => "Bearer #{@other_token}" }
    end

    assert_response :unauthorized
    assert_nil @order.reload.payment
    assert_equal 0, TenantScoped.unscoped_for_system {
      Payment.joins(:order).where(orders: { shop_id: @other_shop.id }).count
    }
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
      post payments_url, params: { order_id: @order.id, token: @order.guest_access_token, amount_cents: 1 }
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
      post payments_url, params: { order_id: @order.id, token: @order.guest_access_token }
    end

    assert_response :unprocessable_entity
    assert_nil @order.reload.payment
    assert_empty @stripe_calls[:update]
  end

  test "guest checkout still creates a platform destination charge" do
    with_stripe do
      post payments_url, params: { order_id: @order.id, token: @order.guest_access_token }
    end

    assert_response :success
    params = @stripe_calls[:create].last[0]
    assert_equal({ enabled: true }, params[:automatic_payment_methods])
    assert_equal({ destination: "acct_a" }, params[:transfer_data])
    assert_equal "acct_a", params[:on_behalf_of]
    assert_nil params[:customer]
    assert_nil params[:setup_future_usage]
    assert_nil params[:payment_method]
  end

  test "guest save card request does not create a platform customer" do
    with_stripe do
      with_platform_customer do
        post payments_url, params: { order_id: @order.id, token: @order.guest_access_token, save_card: true }
      end
    end

    assert_response :success
    assert_empty @stripe_calls[:customers]
    params = @stripe_calls[:create].last[0]
    assert_nil params[:customer]
    assert_nil params[:setup_future_usage]
    assert_equal({ enabled: true }, params[:automatic_payment_methods])
  end

  test "logged in customer can opt in to save a card on the platform customer" do
    Current.shop = nil
    customer, token = login_customer!

    with_stripe do
      with_platform_customer do
        post payments_url,
          params: { order_id: @order.id, save_card: true },
          headers: bearer(token)
      end
    end

    assert_response :success
    assert_equal "cus_platform", customer.reload.stripe_customer_id
    params = @stripe_calls[:create].last[0]
    assert_equal "off_session", params[:setup_future_usage]
    assert_equal "cus_platform", params[:customer]
    assert_equal "true", params[:metadata][:save_card]
    assert_equal customer.id, params[:metadata][:customer_id]
    assert_equal({ enabled: true }, params[:automatic_payment_methods])
    assert_equal({ destination: "acct_a" }, params[:transfer_data])
    assert_equal "acct_a", params[:on_behalf_of]
    assert_nil params[:payment_method]
    assert_equal 1, @stripe_calls[:customers].length
  end

  test "save card opt in updates the pending payment intent" do
    customer, token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "pending",
      stripe_payment_intent_id: "pi_existing"
    )

    with_stripe do
      with_platform_customer do
        post payments_url,
          params: { order_id: @order.id, save_card: true },
          headers: bearer(token)
      end
    end

    assert_response :success
    assert_empty @stripe_calls[:create]
    assert_empty @stripe_calls[:customers]
    update = @stripe_calls[:update].last
    assert_equal "pi_existing", update[0]
    assert_equal "off_session", update[1][:setup_future_usage]
    assert_equal "cus_platform", update[1][:customer]
    assert_equal "true", update[1][:metadata][:save_card]
  end

  test "logged in customer pays with a saved card by cloning it onto the shop" do
    Current.shop = nil
    customer, token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)
    ENV["PLATFORM_FEE_PERCENT"] = "10"

    with_saved_card_stripe(status: "succeeded") do
      post payments_url,
        params: { order_id: @order.id, payment_method_id: card.id, return_url: "https://cafe.example/return" },
        headers: bearer(token)
    end

    assert_response :success
    body = response.parsed_body
    assert_equal "succeeded", body["status"]
    assert_equal "acct_a", body["stripe_account_id"]
    assert_equal "secret_saved", body["client_secret"]

    clone = @stripe_calls[:clone].last
    assert_equal({ customer: "cus_platform", payment_method: "pm_platform" }, clone[0])
    assert_equal({ stripe_account: "acct_a" }, clone[1])

    charge = @stripe_calls[:direct_create].last
    assert_equal "pm_cloned", charge[0][:payment_method]
    assert_equal true, charge[0][:confirm]
    assert_nil charge[0][:off_session]
    assert_equal 180, charge[0][:application_fee_amount]
    assert_equal [ "card" ], charge[0][:payment_method_types]
    assert_equal "https://cafe.example/return", charge[0][:return_url]
    assert_nil charge[0][:transfer_data]
    assert_nil charge[0][:on_behalf_of]
    assert_equal "acct_a", charge[1][:stripe_account]
    assert_match(/\Adirect-pi-#{@order.id}-/, charge[1][:idempotency_key])

    @order.reload
    assert_equal "received", @order.status
    assert_equal "succeeded", @order.payment_status
    assert_equal "pi_saved", @order.payment.stripe_payment_intent_id
    assert_equal "acct_a", @order.payment.stripe_account_id
    assert_equal 1, CustomerPaymentMethod.where(customer: customer).count
  ensure
    ENV["PLATFORM_FEE_PERCENT"] = "0"
  end

  test "saved card charge that requires action leaves the order unpaid until sync" do
    customer, token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)

    with_saved_card_stripe(status: "requires_action") do
      post payments_url,
        params: { order_id: @order.id, payment_method_id: card.id, return_url: "https://cafe.example/return" },
        headers: bearer(token)
    end

    assert_response :success
    body = response.parsed_body
    assert_equal "requires_action", body["status"]
    assert_equal "secret_saved", body["client_secret"]
    assert_equal "acct_a", body["stripe_account_id"]
    @order.reload
    assert_equal "pending_payment", @order.status
    assert_equal "pending", @order.payment_status
    assert_equal "pending", @order.payment.status

    @stripe_calls[:retrieve_status] = "succeeded"
    with_saved_card_stripe(status: "succeeded") do
      post "/payments/sync", params: { order_id: @order.id }, headers: bearer(token)
    end

    assert_response :success
    assert_equal "succeeded", response.parsed_body["status"]
    @order.reload
    assert_equal "received", @order.status
    assert_equal "succeeded", @order.payment_status
    assert_equal 1, @stripe_calls[:clone].length
    assert_equal 1, @stripe_calls[:direct_create].length
  end

  test "repeating a saved card payment does not clone a second charge while action is required" do
    customer, token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)

    with_saved_card_stripe(status: "requires_action") do
      2.times do
        post payments_url,
          params: { order_id: @order.id, payment_method_id: card.id, return_url: "https://cafe.example/return" },
          headers: bearer(token)
        assert_response :success
      end
    end

    assert_equal 1, @stripe_calls[:clone].length
    assert_equal 1, @stripe_calls[:direct_create].length
    assert_equal "pending_payment", @order.reload.status
  end

  test "saved card payment cancels a pending platform intent before the direct charge" do
    customer, token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "pending",
      stripe_payment_intent_id: "pi_platform"
    )

    with_saved_card_stripe(status: "succeeded") do
      post payments_url,
        params: { order_id: @order.id, payment_method_id: card.id, return_url: "https://cafe.example/return" },
        headers: bearer(token)
    end

    assert_response :success
    assert_equal [ "pi_platform" ], @stripe_calls[:cancel]
    assert_equal "acct_a", @stripe_calls[:clone].last[1][:stripe_account]
    assert_equal "pi_saved", @order.reload.payment.stripe_payment_intent_id
  end

  test "saved card for another shop clones onto that shop account only" do
    customer, token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)
    other_order = Order.create!(
      shop: @other_shop,
      customer: customer,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 900,
      total_cents: 900,
      currency: "MXN",
      pickup_type: "asap",
      customer_phone: "5551111111"
    )

    with_saved_card_stripe(status: "succeeded") do
      post payments_url,
        params: { order_id: other_order.id, payment_method_id: card.id, return_url: "https://cafe.example/return" },
        headers: bearer(token)
    end

    assert_response :success
    assert_equal "acct_b", @stripe_calls[:clone].last[1][:stripe_account]
    assert_equal "acct_b", @stripe_calls[:direct_create].last[1][:stripe_account]
    assert_equal 900, @stripe_calls[:direct_create].last[0][:amount]
    assert_nil @order.reload.payment
    assert_equal "received", other_order.reload.status
    assert_not_includes CustomerPaymentMethod.column_names, "shop_id"
    assert_equal [ customer.id ], CustomerPaymentMethod.pluck(:customer_id)
  end

  test "another customer cannot pay with a saved card they do not own" do
    _owner, _token = login_customer!
    customer = @order.reload.customer
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)
    intruder = User.create!(email: "intruder@example.com", password: "password123", role: :customer)
    Customer.create!(user: intruder, name: "Intruder", phone: "5550000000")
    intruder_token = JsonWebToken.encode(user_id: intruder.id)

    with_saved_card_stripe(status: "succeeded") do
      post payments_url,
        params: { order_id: @order.id, payment_method_id: card.id, return_url: "https://cafe.example/return" },
        headers: bearer(intruder_token)
    end

    assert_response :unauthorized
    assert_empty @stripe_calls[:clone]
    assert_empty @stripe_calls[:direct_create]
    assert_equal "pending_payment", @order.reload.status
  end

  test "shop member cannot charge a saved card even with the guest token" do
    customer, _token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)

    with_saved_card_stripe(status: "succeeded") do
      post payments_url,
        params: {
          order_id: @order.id,
          payment_method_id: card.id,
          token: @order.guest_access_token,
          return_url: "https://cafe.example/return"
        },
        headers: bearer(@other_token)
    end

    assert_response :unauthorized
    assert_empty @stripe_calls[:clone]
    assert_nil @order.reload.payment
  end

  test "saved card payment requires a return url" do
    customer, token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)

    with_saved_card_stripe(status: "succeeded") do
      post payments_url,
        params: { order_id: @order.id, payment_method_id: card.id },
        headers: bearer(token)
    end

    assert_response :bad_request
    assert_empty @stripe_calls[:clone]
    assert_nil @order.reload.payment
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
      post payments_url,
        params: { order_id: @order.id, amount_cents: 50 },
        headers: { "X-Order-Token" => @order.guest_access_token }
    end

    assert_response :success
    assert_equal [ [ "pi_existing", 1800 ] ], @stripe_calls[:update].map { |args| [ args[0], args[1][:amount] ] }
    assert_equal 1, Payment.where(order: @order).count
  end

  test "a fully discounted loyalty order is completed without Stripe" do
    customer, token = login_customer!
    @shop.update!(loyalty_stamps_required: 1)
    earned = Order.create!(
      shop: @shop,
      customer: customer,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1_000,
      total_cents: 1_000,
      currency: "MXN",
      pickup_type: "asap"
    )
    earned.apply_successful_payment!
    @order.update!(customer: customer, subtotal_cents: 1_800, total_cents: 1_800, discount_cents: 0)
    LoyaltyStamp.redeem!(@order, customer, [ OrderPricing::Line.new(unit_price_cents: 1_800, quantity: 1, subtotal_cents: 1_800) ])

    post payments_url,
      params: { order_id: @order.id, amount_cents: 1_800 },
      headers: bearer(token)

    assert_response :success
    assert_equal "succeeded", response.parsed_body["status"]
    assert_nil response.parsed_body["client_secret"]
    @order.reload
    assert_equal 0, @order.total_cents
    assert_equal "succeeded", @order.payment_status
    assert_equal "received", @order.status
    assert_equal 0, @order.payment.amount_cents
    assert_empty @stripe_calls[:create]
  end

  test "platform payment intents are created with an idempotency key" do
    with_stripe do
      post payments_url, params: { order_id: @order.id, token: @order.guest_access_token }
    end

    assert_response :success
    options = @stripe_calls[:create].last[1]
    assert_kind_of Hash, options
    assert_match(/\Aplatform-pi-#{@order.id}-/, options[:idempotency_key])
  end

  test "client supplied application fee is ignored" do
    previous = ENV["PLATFORM_FEE_PERCENT"]
    ENV["PLATFORM_FEE_PERCENT"] = "10"

    with_stripe do
      post payments_url, params: {
        order_id: @order.id,
        token: @order.guest_access_token,
        amount_cents: 1,
        application_fee_amount: 1
      }
    end

    assert_response :success
    assert_equal 180, @stripe_calls[:create].last[0][:application_fee_amount]
    assert_equal 1800, @stripe_calls[:create].last[0][:amount]
    assert_equal 180, @order.reload.payment.platform_fee_cents
  ensure
    if previous.nil?
      ENV.delete("PLATFORM_FEE_PERCENT")
    else
      ENV["PLATFORM_FEE_PERCENT"] = previous
    end
  end

  test "checkout reports stripe as not configured when the secret is a placeholder" do
    previous = ENV["STRIPE_SECRET_KEY"]
    ENV["STRIPE_SECRET_KEY"] = "sk_test_placeholder"

    logs = capture_rails_logs do
      with_stripe do
        post payments_url, params: { order_id: @order.id, token: @order.guest_access_token }
      end
    end

    assert_response :service_unavailable
    assert_equal "stripe_not_configured", response.parsed_body["error"]
    assert_empty @stripe_calls[:create]
    assert_nil @order.reload.payment
    assert_match(/payment.stripe_not_configured/, logs)
  ensure
    ENV["STRIPE_SECRET_KEY"] = previous
  end

  test "a free loyalty order still completes when Stripe keys are placeholders" do
    previous = ENV["STRIPE_SECRET_KEY"]
    ENV["STRIPE_SECRET_KEY"] = "sk_test_placeholder"
    @order.update!(total_cents: 0, subtotal_cents: 0, loyalty_redeemed: true)

    post payments_url, params: { order_id: @order.id, token: @order.guest_access_token }

    assert_response :success
    assert_equal "succeeded", response.parsed_body["status"]
    assert_equal "received", @order.reload.status
    assert_empty @stripe_calls[:create]
  ensure
    ENV["STRIPE_SECRET_KEY"] = previous
  end

  test "a succeeded platform intent is fulfilled instead of charging a saved card" do
    customer, token = login_customer!
    customer.update!(stripe_customer_id: "cus_platform")
    card = save_card!(customer)
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "pending",
      stripe_payment_intent_id: "pi_platform"
    )
    @stripe_calls[:retrieve_status] = "succeeded"
    @stripe_calls[:retrieve_amount] = 1800

    with_saved_card_stripe(status: "succeeded") do
      post payments_url,
        params: { order_id: @order.id, payment_method_id: card.id, return_url: "https://cafe.example/return" },
        headers: bearer(token)
    end

    assert_response :success
    assert_equal "succeeded", response.parsed_body["status"]
    assert_empty @stripe_calls[:clone]
    assert_empty @stripe_calls[:direct_create]
    assert_empty @stripe_calls[:cancel]
    assert_equal "received", @order.reload.status
    assert_equal "pi_platform", @order.payment.stripe_payment_intent_id
  end

  test "repeating checkout fulfills an intent Stripe already captured" do
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "pending",
      stripe_payment_intent_id: "pi_existing"
    )
    @stripe_calls[:retrieve_status] = "succeeded"
    @stripe_calls[:retrieve_amount] = 1800

    with_stripe do
      post payments_url, params: { order_id: @order.id, token: @order.guest_access_token, amount_cents: 1 }
    end

    assert_response :success
    assert_equal "succeeded", response.parsed_body["status"]
    assert_empty @stripe_calls[:create]
    assert_empty @stripe_calls[:update]
    assert_equal "received", @order.reload.status
    assert_equal "succeeded", @order.payment_status
  end

  test "sync of a canceled intent cancels the unpaid order" do
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "pending",
      stripe_payment_intent_id: "pi_sync"
    )
    @stripe_calls[:retrieve_status] = "canceled"

    with_stripe do
      post "/payments/sync", params: { order_id: @order.id, token: @order.guest_access_token }
    end

    assert_response :success
    assert_equal "failed", response.parsed_body["status"]
    assert_equal "cancelled", @order.reload.status
    assert_equal "failed", @order.payment_status
    assert_equal "failed", @order.payment.status
  end

  test "sync of a declined card leaves the order payable" do
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "pending",
      stripe_payment_intent_id: "pi_sync"
    )
    @stripe_calls[:retrieve_status] = "requires_payment_method"

    with_stripe do
      post "/payments/sync", params: { order_id: @order.id, token: @order.guest_access_token }
    end

    assert_response :success
    assert_equal "failed", response.parsed_body["status"]
    assert_equal "pending_payment", @order.reload.status
    assert_equal "pending", @order.payment_status
    assert_equal "failed", @order.payment.status
  end

  test "sync does not fulfill an intent whose amount does not match the order" do
    Payment.create!(
      order: @order,
      amount_cents: 1800,
      currency: "MXN",
      status: "pending",
      stripe_payment_intent_id: "pi_sync"
    )
    @stripe_calls[:retrieve_status] = "succeeded"
    @stripe_calls[:retrieve_amount] = 50

    logs = capture_rails_logs do
      with_stripe do
        post "/payments/sync", params: { order_id: @order.id, token: @order.guest_access_token }
      end
    end

    assert_response :unprocessable_entity
    assert_equal "payment_amount_mismatch", response.parsed_body["error"]
    assert_equal "pending_payment", @order.reload.status
    assert_equal "pending", @order.payment_status
    assert_match(/payment.amount_mismatch/, logs)
  end

  private

  def login_customer!
    user = User.create!(email: "buyer-#{SecureRandom.hex(4)}@example.com", password: "password123", role: :customer)
    customer = Customer.create!(user: user, name: "Ana", phone: "5551111111")
    @order.update!(customer: customer, customer_phone: "5551111111")
    [ customer, JsonWebToken.encode(user_id: user.id) ]
  end

  def save_card!(customer)
    CustomerPaymentMethod.create!(
      customer: customer,
      stripe_payment_method_id: "pm_platform",
      brand: "visa",
      last4: "4242",
      exp_month: 12,
      exp_year: 2028
    )
  end

  def bearer(token)
    { "Authorization" => "Bearer #{token}" }
  end

  def with_stripe
    intent = OpenStruct.new(id: "pi_new", client_secret: "secret_test", status: "requires_payment_method")
    original_create = Stripe::PaymentIntent.method(:create)
    original_update = Stripe::PaymentIntent.method(:update)
    original_retrieve = Stripe::PaymentIntent.method(:retrieve)
    calls = @stripe_calls
    Stripe::PaymentIntent.define_singleton_method(:create) do |*args|
      calls[:create] << args
      intent
    end
    Stripe::PaymentIntent.define_singleton_method(:update) do |*args|
      calls[:update] << args
      intent
    end
    Stripe::PaymentIntent.define_singleton_method(:retrieve) do |id, *args|
      calls[:retrieve] ||= []
      calls[:retrieve] << [ id, args ]
      OpenStruct.new(
        id: id,
        client_secret: "secret_test",
        status: calls[:retrieve_status] || "requires_payment_method",
        amount: calls.key?(:retrieve_amount) ? calls[:retrieve_amount] : 1800,
        currency: "mxn",
        application_fee_amount: calls[:retrieve_fee]
      )
    end
    yield
  ensure
    Stripe::PaymentIntent.define_singleton_method(:create, original_create)
    Stripe::PaymentIntent.define_singleton_method(:update, original_update)
    Stripe::PaymentIntent.define_singleton_method(:retrieve, original_retrieve)
  end

  def with_platform_customer
    original = Stripe::Customer.method(:create)
    calls = @stripe_calls
    calls[:customers] = []
    Stripe::Customer.define_singleton_method(:create) do |*args|
      calls[:customers] << args
      OpenStruct.new(id: "cus_platform")
    end
    yield
  ensure
    Stripe::Customer.define_singleton_method(:create, original)
  end

  def with_saved_card_stripe(status:)
    calls = @stripe_calls
    calls[:clone] ||= []
    calls[:direct_create] ||= []
    calls[:cancel] ||= []
    calls[:retrieve] ||= []
    original_pm_create = Stripe::PaymentMethod.method(:create)
    original_pi_create = Stripe::PaymentIntent.method(:create)
    original_pi_cancel = Stripe::PaymentIntent.method(:cancel)
    original_pi_retrieve = Stripe::PaymentIntent.method(:retrieve)

    Stripe::PaymentMethod.define_singleton_method(:create) do |*args|
      calls[:clone] << args
      OpenStruct.new(id: "pm_cloned")
    end
    Stripe::PaymentIntent.define_singleton_method(:create) do |*args|
      if args[1].is_a?(Hash) && args[1][:stripe_account].present?
        calls[:direct_create] << args
        OpenStruct.new(
          id: "pi_saved",
          client_secret: "secret_saved",
          status: status,
          amount: args[0][:amount],
          currency: args[0][:currency],
          application_fee_amount: args[0][:application_fee_amount]
        )
      else
        calls[:create] << args
        OpenStruct.new(id: "pi_new", client_secret: "secret_test", status: "requires_payment_method")
      end
    end
    Stripe::PaymentIntent.define_singleton_method(:cancel) do |id, *|
      calls[:cancel] << id
      OpenStruct.new(id: id, status: "canceled")
    end
    Stripe::PaymentIntent.define_singleton_method(:retrieve) do |id, *args|
      calls[:retrieve] << [ id, args ]
      OpenStruct.new(
        id: id,
        client_secret: "secret_saved",
        status: calls[:retrieve_status] || "requires_action",
        amount: calls.key?(:retrieve_amount) ? calls[:retrieve_amount] : 1800,
        currency: "mxn",
        application_fee_amount: calls[:retrieve_fee]
      )
    end
    yield
  ensure
    Stripe::PaymentMethod.define_singleton_method(:create, original_pm_create)
    Stripe::PaymentIntent.define_singleton_method(:create, original_pi_create)
    Stripe::PaymentIntent.define_singleton_method(:cancel, original_pi_cancel)
    Stripe::PaymentIntent.define_singleton_method(:retrieve, original_pi_retrieve)
  end
end
