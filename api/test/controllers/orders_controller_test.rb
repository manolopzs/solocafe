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
    Current.shop = @shop
    assert_equal 0, Event.where(order: @order, event_type: "order.kitchen_new").count
  end

  test "kitchen view returns open paid tickets sync policy and shop alerts" do
    preparing = create_order(@shop, status: "preparing")
    ready = create_order(@shop, status: "ready", payment_status: "refunded")
    picked_up = create_order(@shop, status: "picked_up")
    cancelled = create_order(@shop, status: "cancelled")
    unpaid = create_order(@shop, status: "pending_payment", payment_status: "pending")

    recent = Event.create!(shop: @shop, order: @order, event_type: "order.kitchen_new", payload: {})
    recent.update_column(:created_at, 1.minute.ago)
    stale = Event.create!(shop: @shop, order: preparing, event_type: "order.kitchen_new", payload: {})
    stale.update_column(:created_at, 2.hours.ago)
    foreign = Event.create!(shop: @other_shop, order: @other_order, event_type: "order.kitchen_new", payload: {})
    foreign.update_column(:created_at, 1.minute.ago)

    get shop_orders_url(@shop),
      params: { view: "kitchen", since: 30.minutes.ago.iso8601(6) },
      headers: auth_headers
    assert_response :success

    body = response.parsed_body
    order_ids = body["orders"].map { |order| order["id"] }
    assert_includes order_ids, @order.id
    assert_includes order_ids, preparing.id
    assert_includes order_ids, ready.id
    assert_not_includes order_ids, picked_up.id
    assert_not_includes order_ids, cancelled.id
    assert_not_includes order_ids, unpaid.id
    assert_not_includes order_ids, @other_order.id

    assert_equal [ 1000, 2000, 4000, 8000, 16000, 30000 ], body["sync"]["retry_delays_ms"]
    assert_equal 5000, body["sync"]["poll_interval_ms"]
    assert body["sync"]["server_time"].present?

    received = body["orders"].find { |order| order["id"] == @order.id }
    assert_equal [ "preparing", "cancelled" ], received["allowed_transitions"]

    alert_ids = body["alerts"].map { |alert| alert["order_id"] }
    assert_equal [ @order.id ], alert_ids
    assert_equal "order.kitchen_new", body["alerts"].first["event_type"]
    assert_not_includes alert_ids, foreign.order_id
  end

  test "kitchen view rejects an invalid since cursor" do
    get shop_orders_url(@shop), params: { view: "kitchen", since: "nope" }, headers: auth_headers
    assert_response :unprocessable_entity
  end

  test "kitchen view is forbidden for another shop" do
    get shop_orders_url(@other_shop), params: { view: "kitchen" }, headers: auth_headers
    assert_response :forbidden
  end

  test "cancelling an order releases its pickup slot" do
    Current.shop = @shop
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

  test "public order show accepts a valid access token and hides the phone" do
    @order.update!(customer_name: "Ana", customer_phone: "5551111111")

    get "/public/orders/#{@order.id}", params: { token: @order.guest_access_token }

    assert_response :success
    body = response.parsed_body["order"]
    assert_equal @order.id, body["id"]
    assert_equal "Ana", body["customer_name"]
    assert_not body.key?("customer_phone")
    assert body["access_token"].present?
    assert body["shop"]["name"].present?
  end

  test "public order show accepts the access token header" do
    get "/public/orders/#{@order.id}", headers: { "X-Order-Token" => @order.guest_access_token }

    assert_response :success
    assert_equal @order.id, response.parsed_body.dig("order", "id")
  end

  test "public order show rejects an invalid access token" do
    get "/public/orders/#{@order.id}", params: { token: "not-a-token", customer_phone: "5551111111" }

    assert_response :forbidden
  end

  test "public order show rejects a token from another tenant" do
    get "/public/orders/#{@other_order.id}", params: { token: @order.guest_access_token }

    assert_response :forbidden

    get "/public/orders/#{@order.id}", headers: { "X-Order-Token" => @other_order.guest_access_token }

    assert_response :forbidden
  end

  test "guest checkout does not attach an order to an existing customer by phone" do
    user = User.create!(email: "ana@example.com", password: "password123")
    customer = Customer.create!(user: user, name: "Ana", phone: "5551234567")
    item = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 4500, prep_time_min: 6, is_active: true, is_86ed: false)

    travel_to Time.find_zone(@shop.timezone).local(2026, 10, 20, 10, 0, 0) do
      post shop_orders_url(@shop), params: {
        order: {
          customer_name: "Otra persona",
          customer_phone: "5551234567",
          pickup_type: "asap",
          items: [ { menu_item_id: item.id, quantity: 1, modifier_option_ids: [] } ]
        }
      }
    end

    assert_response :created
    Current.shop = @shop
    created = Order.find(response.parsed_body.dig("order", "id"))
    assert_nil created.customer_id
    assert_equal "5551234567", created.customer_phone
    assert_equal 0, customer.orders.count
    assert_not response.parsed_body["order"].key?("customer_phone")
  end

  test "asap checkout is rejected when the shop is closed" do
    item = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 4500, prep_time_min: 5, is_active: true, is_86ed: false)

    travel_to Time.find_zone(@shop.timezone).local(2026, 10, 20, 22, 0, 0) do
      post shop_orders_url(@shop), params: asap_order_params(item)
    end

    assert_response :unprocessable_entity
    assert_equal "shop_closed", response.parsed_body["error"]
  end

  test "checkout is rejected when the shop is not accepting pickup orders" do
    @shop.update!(accepting_pickup: false)
    item = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 4500, prep_time_min: 5, is_active: true, is_86ed: false)

    travel_to Time.find_zone(@shop.timezone).local(2026, 10, 20, 10, 0, 0) do
      post shop_orders_url(@shop), params: asap_order_params(item)
    end

    assert_response :unprocessable_entity
    assert_equal "not_accepting", response.parsed_body["error"]
  end

  test "estimated ready minutes come from the ordered items and the queue" do
    @order.update!(status: "picked_up")
    @shop.update!(prep_time_buffer_minutes: 10)
    MenuItem.create!(shop: @shop, name: "Galleta", price_cents: 2000, prep_time_min: 2, is_active: true, is_86ed: false)
    latte = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 5000, prep_time_min: 9, is_active: true, is_86ed: false)
    Order.create!(
      shop: @shop,
      status: "preparing",
      payment_status: "succeeded",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )

    travel_to Time.find_zone(@shop.timezone).local(2026, 10, 20, 10, 0, 0) do
      post shop_orders_url(@shop), params: {
        order: {
          customer_name: "Ana",
          customer_phone: "5550001111",
          pickup_type: "asap",
          items: [ { menu_item_id: latte.id, quantity: 2, modifier_option_ids: [] } ]
        }
      }
    end

    assert_response :created
    assert_equal 29, response.parsed_body.dig("order", "estimated_ready_minutes")
    assert response.parsed_body.dig("order", "pickup_window_starts_at").present?
    assert response.parsed_body.dig("order", "pickup_window_ends_at").present?
  end

  test "usual order is the most frequent paid order at this shop" do
    user = User.create!(email: "regular@example.com", password: "password123")
    customer = Customer.create!(user: user, name: "Regular", phone: "5552223333")
    latte = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 5000, prep_time_min: 5, is_active: true, is_86ed: false)
    cookie = MenuItem.create!(shop: @shop, name: "Galleta", price_cents: 2000, prep_time_min: 2, is_active: true, is_86ed: false)
    group = ModifierGroup.create!(shop: @shop, name: "Leche", min_select: 0, max_select: 1)
    oat = ModifierOption.create!(group: group, name: "Avena", price_cents: 0, is_active: true)
    ItemModifierLink.create!(item: latte, group: group)

    2.times { create_paid_line(customer, latte, [ oat ]) }
    create_paid_line(customer, cookie, [])

    token = JsonWebToken.encode(user_id: user.id)
    get usual_shop_order_url(@shop), headers: { "Authorization" => "Bearer #{token}" }

    assert_response :success
    usual = response.parsed_body["usual_order"]
    assert_equal 2, usual["times_ordered"]
    assert_equal true, usual["can_reorder"]
    assert_equal [ latte.id ], usual["items"].map { |item| item["menu_item_id"] }
    assert_equal [ oat.id ], usual["items"].first["modifier_option_ids"]
    assert_equal "Latte con Avena", usual["label"]

    latte.update!(is_86ed: true)
    get usual_shop_order_url(@shop), headers: { "Authorization" => "Bearer #{token}" }
    assert_equal false, response.parsed_body.dig("usual_order", "items", 0, "available")
    assert_equal "sold_out", response.parsed_body.dig("usual_order", "items", 0, "unavailable_reason")
  end

  test "usual order ignores paid orders from another shop" do
    user = User.create!(email: "traveler@example.com", password: "password123")
    customer = Customer.create!(user: user, name: "Viaje", phone: "5552224444")
    home_item = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 5000, prep_time_min: 5, is_active: true, is_86ed: false)
    other_item = MenuItem.create!(shop: @other_shop, name: "Espresso", price_cents: 3000, prep_time_min: 3, is_active: true, is_86ed: false)
    create_paid_line(customer, home_item, [])
    3.times { create_paid_line(customer, other_item, []) }

    token = JsonWebToken.encode(user_id: user.id)
    get usual_shop_order_url(@shop), headers: { "Authorization" => "Bearer #{token}" }

    assert_response :success
    assert_equal [ home_item.id ], response.parsed_body["usual_order"]["items"].map { |item| item["menu_item_id"] }
  end

  test "listing orders does not query once per order for the estimate" do
    item = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 5000, prep_time_min: 5, is_active: true, is_86ed: false)
    create_order(@shop)
    baseline = query_count { get shop_orders_url(@shop), headers: auth_headers }
    assert_response :success

    4.times do
      order = create_order(@shop)
      order.order_items.create!(
        item: item,
        item_name_snapshot: item.name,
        unit_price_cents: item.price_cents,
        quantity: 1,
        subtotal_cents: item.price_cents
      )
    end

    loaded = query_count { get shop_orders_url(@shop), headers: auth_headers }
    assert_response :success
    assert_operator loaded - baseline, :<=, 4
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end

  def create_order(shop, status: "received", payment_status: "succeeded")
    Order.create!(
      shop: shop,
      status: status,
      payment_status: payment_status,
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )
  end

  def asap_order_params(item)
    {
      order: {
        customer_name: "Ana",
        customer_phone: "5550001111",
        pickup_type: "asap",
        items: [ { menu_item_id: item.id, quantity: 1, modifier_option_ids: [] } ]
      }
    }
  end

  def create_paid_line(customer, item, modifiers)
    order = Order.create!(
      shop: item.shop,
      customer: customer,
      status: "picked_up",
      payment_status: "succeeded",
      subtotal_cents: item.price_cents,
      total_cents: item.price_cents,
      currency: "MXN",
      pickup_type: "asap",
      customer_name: customer.name
    )
    order_item = order.order_items.create!(
      item: item,
      item_name_snapshot: item.name,
      unit_price_cents: item.price_cents,
      quantity: 1,
      subtotal_cents: item.price_cents
    )
    modifiers.each do |modifier|
      order_item.order_item_modifiers.create!(
        option: modifier,
        option_name_snapshot: modifier.name,
        price_cents: modifier.price_cents
      )
    end
    order
  end

  def query_count
    count = 0
    callback = lambda do |_name, _start, _finish, _id, payload|
      next if payload[:name].in?(%w[SCHEMA CACHE])
      next if payload[:cached]
      next if payload[:sql].to_s.match?(/SCHEMA|pg_|sqlite_/)
      count += 1
    end
    ActiveSupport::Notifications.subscribed(callback, "sql.active_record") { yield }
    count
  end
end
