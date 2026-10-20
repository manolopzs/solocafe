require "test_helper"

class OrdersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner@example.com", password: "password123")
    @other_user = User.create!(email: "other@example.com", password: "password123")

    @shop = Shop.create!(name: "Cafe A", slug: "cafe-a", currency: "MXN", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe B", slug: "cafe-b", currency: "MXN", owner: @other_user)

    ShopMember.create!(shop: @shop, user: @owner, role: :owner)
    ShopMember.create!(shop: @other_shop, user: @other_user, role: :owner)

    @order = create_order(@shop)
    @other_order = create_order(@other_shop)

    @token = JsonWebToken.encode(user_id: @owner.id)
  end

  test "kitchen list excludes unpaid orders" do
    unpaid = Order.create!(
      shop: @shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )

    get shop_orders_url(@shop), headers: auth_headers
    assert_response :success

    order_ids = response.parsed_body["orders"].map { |o| o["id"] }
    assert_includes order_ids, @order.id
    assert_not_includes order_ids, unpaid.id
    assert_not_includes order_ids, @other_order.id
  end

  test "staff cannot move an unpaid order to received" do
    unpaid = Order.create!(
      shop: @shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap",
      customer_phone: "5551111111"
    )

    patch shop_order_url(@shop, unpaid), params: { order: { status: "received" } }, headers: auth_headers
    assert_response :unprocessable_entity
    assert_equal "pending_payment", unpaid.reload.status

    patch shop_order_url(@shop, unpaid), params: { order: { status: "preparing" } }, headers: auth_headers
    assert_response :unprocessable_entity
    assert_equal "pending_payment", unpaid.reload.status
  end

  test "staff can advance a paid order from received to preparing" do
    patch shop_order_url(@shop, @order), params: { order: { status: "preparing" } }, headers: auth_headers
    assert_response :success
    assert_equal "preparing", @order.reload.status
  end

  test "cancelling an order releases its pickup slot" do
    slot = @shop.pickup_slots.create!(
      slot_date: Date.current + 3,
      start_time: "09:00:00",
      end_time: "09:15:00",
      capacity: 2
    )
    SlotReservation.create!(slot: slot, order: @order)
    @order.update!(pickup_slot: slot, pickup_type: "scheduled")

    patch shop_order_url(@shop, @order), params: { order: { status: "cancelled" } }, headers: auth_headers
    assert_response :success
    assert_equal "cancelled", @order.reload.status
    assert_nil @order.slot_reservation
  end

  test "staff can list their own shop orders" do
    get shop_orders_url(@shop), headers: auth_headers
    assert_response :success

    order_ids = response.parsed_body["orders"].map { |o| o["id"] }
    assert_includes order_ids, @order.id
    assert_not_includes order_ids, @other_order.id
  end

  test "staff cannot list another shop orders" do
    get shop_orders_url(@other_shop), headers: auth_headers
    assert_response :forbidden
  end

  test "staff cannot update another shop order" do
    patch shop_order_url(@other_shop, @other_order), params: { status: "ready" }, headers: auth_headers
    assert_response :forbidden
  end

  test "customer can list recent paid orders for a shop" do
    customer_user = User.create!(email: "customer@example.com", password: "password123")
    customer = Customer.create!(user: customer_user, name: "Cliente", phone: "+525555555555")
    customer_order = Order.create!(
      shop: @shop,
      customer: customer,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )

    token = JsonWebToken.encode(user_id: customer_user.id)
    get recent_shop_orders_url(@shop), headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success

    order_ids = response.parsed_body["orders"].map { |o| o["id"] }
    assert_includes order_ids, customer_order.id
  end

  test "recent orders exclude cancelled orders" do
    customer_user = User.create!(email: "customer2@example.com", password: "password123")
    customer = Customer.create!(user: customer_user, name: "Cliente", phone: "+525555555556")
    Order.create!(
      shop: @shop,
      customer: customer,
      status: "cancelled",
      payment_status: "succeeded",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )

    token = JsonWebToken.encode(user_id: customer_user.id)
    get recent_shop_orders_url(@shop), headers: { "Authorization" => "Bearer #{token}" }
    assert_response :success

    assert_empty response.parsed_body["orders"]
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end

  def create_order(shop)
    Order.create!(
      shop: shop,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )
  end
end
