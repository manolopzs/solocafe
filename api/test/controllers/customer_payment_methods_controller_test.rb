require "test_helper"

class CustomerPaymentMethodsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(email: "buyer@example.com", password: "password123", role: :customer)
    @other_user = User.create!(email: "other-buyer@example.com", password: "password123", role: :customer)
    @owner = User.create!(email: "owner@example.com", password: "password123")
    @token = JsonWebToken.encode(user_id: @user.id)
    @other_token = JsonWebToken.encode(user_id: @other_user.id)
    @owner_token = JsonWebToken.encode(user_id: @owner.id)

    @customer = Customer.create!(user: @user, name: "Ana", phone: "5551111111", stripe_customer_id: "cus_ana")
    @other_customer = Customer.create!(user: @other_user, name: "Luis", phone: "5552222222", stripe_customer_id: "cus_luis")
    @shop = Shop.create!(name: "Cafe A", slug: "cafe-a", currency: "MXN", stripe_account_id: "acct_a", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe B", slug: "cafe-b", currency: "MXN", stripe_account_id: "acct_b", owner: @owner)
    ShopMember.create!(shop: @shop, user: @owner, role: :owner)

    @card = CustomerPaymentMethod.create!(
      customer: @customer,
      stripe_payment_method_id: "pm_ana",
      brand: "visa",
      last4: "4242",
      exp_month: 12,
      exp_year: 2028
    )
    @other_card = CustomerPaymentMethod.create!(
      customer: @other_customer,
      stripe_payment_method_id: "pm_luis",
      brand: "mastercard",
      last4: "4444",
      exp_month: 1,
      exp_year: 2029
    )
    @order = Order.create!(
      shop: @shop,
      customer: @customer,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 1800,
      total_cents: 1800,
      currency: "MXN",
      pickup_type: "asap",
      customer_phone: "5551111111"
    )
    @detach_calls = []
  end

  test "lists the authenticated customer's saved cards" do
    get "/customers/me/payment_methods", headers: bearer(@token)

    assert_response :success
    cards = response.parsed_body["payment_methods"]
    assert_equal 1, cards.length
    assert_equal @card.id, cards.first["id"]
    assert_equal "visa", cards.first["brand"]
    assert_equal "4242", cards.first["last4"]
    assert_equal 12, cards.first["exp_month"]
    assert_equal 2028, cards.first["exp_year"]
    assert_nil cards.first["stripe_payment_method_id"]
    assert_not_includes response.body, "pm_ana"
    assert_not_includes response.body, "4444"
  end

  test "unauthenticated access to saved cards is rejected" do
    get "/customers/me/payment_methods"
    assert_response :unauthorized
  end

  test "another customer cannot list or delete these cards" do
    get "/customers/me/payment_methods", headers: bearer(@other_token)
    assert_response :success
    ids = response.parsed_body["payment_methods"].map { |card| card["id"] }
    assert_equal [ @other_card.id ], ids
    assert_not_includes response.body, "4242"

    with_detach do
      delete "/customers/me/payment_methods/#{@card.id}", headers: bearer(@other_token)
    end

    assert_response :not_found
    assert CustomerPaymentMethod.exists?(@card.id)
    assert_empty @detach_calls
  end

  test "shop staff cannot see a customer card through the shop" do
    Current.shop = @other_shop
    get "/shops/#{@shop.id}/orders/#{@order.id}", headers: bearer(@owner_token)

    assert_response :success
    assert_not_includes response.body, "4242"
    assert_not_includes response.body, "pm_ana"
    assert_not_includes response.body, "cus_ana"

    get "/customers/me/payment_methods", headers: bearer(@owner_token)
    assert_response :success
    assert_empty response.parsed_body["payment_methods"]
  ensure
    Current.shop = nil
  end

  test "listing cards ignores the current shop tenant" do
    Current.shop = @other_shop
    get "/customers/me/payment_methods", headers: bearer(@token)

    assert_response :success
    assert_equal [ @card.id ], response.parsed_body["payment_methods"].map { |card| card["id"] }
    assert_not_includes CustomerPaymentMethod.column_names, "shop_id"
  ensure
    Current.shop = nil
  end

  test "list and detach work when no shop is current" do
    Current.shop = nil

    get "/customers/me/payment_methods", headers: bearer(@token)
    assert_response :success
    assert_equal [ @card.id ], response.parsed_body["payment_methods"].map { |card| card["id"] }

    with_detach do
      delete "/customers/me/payment_methods/#{@card.id}", headers: bearer(@token)
    end

    assert_response :success
    assert_not CustomerPaymentMethod.exists?(@card.id)
    assert CustomerPaymentMethod.exists?(@other_card.id)
    assert_equal [ "pm_ana" ], @detach_calls
    assert_nil Current.shop
  end

  test "customer can delete their own saved card" do
    with_detach do
      delete "/customers/me/payment_methods/#{@card.id}", headers: bearer(@token)
    end

    assert_response :success
    assert_not CustomerPaymentMethod.exists?(@card.id)
    assert_equal [ "pm_ana" ], @detach_calls
    assert CustomerPaymentMethod.exists?(@other_card.id)
  end

  private

  def bearer(token)
    { "Authorization" => "Bearer #{token}" }
  end

  def with_detach
    original = Stripe::PaymentMethod.method(:detach)
    calls = @detach_calls
    Stripe::PaymentMethod.define_singleton_method(:detach) do |id, *|
      calls << id
      OpenStruct.new(id: id)
    end
    yield
  ensure
    Stripe::PaymentMethod.define_singleton_method(:detach, original)
  end
end
