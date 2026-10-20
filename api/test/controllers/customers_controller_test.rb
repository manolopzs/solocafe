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

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end
end
