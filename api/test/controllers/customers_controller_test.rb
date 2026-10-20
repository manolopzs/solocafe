require "test_helper"

class CustomersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(email: "customer@example.com", password: "password123", role: :customer)
    @token = JsonWebToken.encode(user_id: @user.id)

    @shop = Shop.create!(name: "Cafe A", slug: "cafe-a", currency: "MXN")
    @menu_item = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 5000)
  end

  test "unauthenticated user cannot access customer profile" do
    get customers_me_url
    assert_response :unauthorized
  end

  test "authenticated user can view their customer profile" do
    get customers_me_url, headers: auth_headers
    assert_response :success

    body = response.parsed_body
    assert_equal @user.id, body["customer"]["user_id"]
    assert_equal "customer", body["customer"]["name"]
  end

  test "authenticated user can update their customer profile" do
    patch customers_me_url, params: { customer: { name: "María", phone: "+525555555555" } }, headers: auth_headers
    assert_response :success

    body = response.parsed_body
    assert_equal "María", body["customer"]["name"]
    assert_equal "+525555555555", body["customer"]["phone"]
  end

  test "authenticated user can view their order history" do
    customer = Customer.create!(user: @user, name: "María", phone: "+525555555555")
    Order.create!(
      shop: @shop,
      customer: customer,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 5000,
      total_cents: 5000,
      currency: "MXN",
      pickup_type: "asap"
    )

    get customers_me_orders_url, headers: auth_headers
    assert_response :success

    orders = response.parsed_body["orders"]
    assert_equal 1, orders.length
    assert_equal 5000, orders.first["total_cents"]
  end

  test "order history includes the customer's orders from every shop" do
    other_shop = Shop.create!(name: "Cafe B", slug: "cafe-b-history", currency: "MXN")
    customer = Customer.create!(user: @user, name: "María", phone: "+525555555555")
    Order.create!(
      shop: @shop,
      customer: customer,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )
    Order.create!(
      shop: other_shop,
      customer: customer,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 2000,
      total_cents: 2000,
      currency: "MXN",
      pickup_type: "asap"
    )

    get customers_me_orders_url, headers: auth_headers

    assert_response :success
    totals = response.parsed_body["orders"].map { |order| order["total_cents"] }
    assert_equal [ 1000, 2000 ].sort, totals.sort
  end

  test "user cannot see another user's orders in history" do
    other_user = User.create!(email: "other@example.com", password: "password123", role: :customer)
    other_customer = Customer.create!(user: other_user, name: "Otro", phone: "+525555555556")
    Order.create!(
      shop: @shop,
      customer: other_customer,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 5000,
      total_cents: 5000,
      currency: "MXN",
      pickup_type: "asap"
    )

    get customers_me_orders_url, headers: auth_headers
    assert_response :success

    orders = response.parsed_body["orders"]
    assert_empty orders
  end

  test "loyalty cards count stamps per shop and hide another customer" do
    customer = Customer.create!(user: @user, name: "María", phone: "+525555555555")
    other_user = User.create!(email: "other-loyalty@example.com", password: "password123", role: :customer)
    other_customer = Customer.create!(user: other_user, name: "Luis", phone: "+525555555556")
    other_shop = Shop.create!(name: "Cafe B", slug: "cafe-b-loyalty", currency: "MXN", loyalty_stamps_required: 4, loyalty_reward_text: "Galleta gratis")
    @shop.update!(loyalty_stamps_required: 3, loyalty_reward_text: "Café gratis")
    paid = ->(person, shop) {
      order = Order.create!(
        shop: shop,
        customer: person,
        status: "pending_payment",
        payment_status: "pending",
        subtotal_cents: 1_000,
        total_cents: 1_000,
        currency: "MXN",
        pickup_type: "asap"
      )
      order.apply_successful_payment!
    }
    2.times { paid.call(customer, @shop) }
    paid.call(customer, other_shop)
    paid.call(other_customer, @shop)

    get "/customers/me/loyalty", headers: auth_headers

    assert_response :success
    cards = response.parsed_body["cards"]
    assert_equal [ @shop.name, other_shop.name ], cards.map { |card| card["shop_name"] }
    home = cards.find { |card| card["shop_id"] == @shop.id }
    away = cards.find { |card| card["shop_id"] == other_shop.id }
    assert_equal 2, home["stamps"]
    assert_equal 3, home["stamps_required"]
    assert_equal "Café gratis", home["reward_text"]
    assert_equal false, home["can_redeem"]
    assert_equal 1, away["stamps"]
    assert_equal 4, away["stamps_required"]
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end
end
