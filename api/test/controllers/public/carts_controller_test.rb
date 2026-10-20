require "test_helper"

class Public::CartsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @shop = Shop.create!(
      name: "Cart Cafe",
      slug: "cart-cafe",
      currency: "MXN",
      timezone: "America/Mexico_City",
      prep_time_buffer_minutes: 10,
      accepting_pickup: true
    )
    @cookie = MenuItem.create!(shop: @shop, name: "Galleta", price_cents: 2000, prep_time_min: 2, is_active: true, is_86ed: false)
    @latte = MenuItem.create!(shop: @shop, name: "Latte", price_cents: 5000, prep_time_min: 8, is_active: true, is_86ed: false)
  end

  test "preview marks an 86ed item and estimates from the available lines" do
    @cookie.update!(is_86ed: true)
    Order.create!(
      shop: @shop,
      status: "received",
      payment_status: "succeeded",
      subtotal_cents: 1000,
      total_cents: 1000,
      currency: "MXN",
      pickup_type: "asap"
    )

    travel_to Time.find_zone(@shop.timezone).local(2026, 10, 20, 10, 0, 0) do
      post "/public/shops/#{@shop.id}/cart/preview", params: {
        pickup_type: "asap",
        items: [
          { menu_item_id: @cookie.id, quantity: 1, modifier_option_ids: [] },
          { menu_item_id: @latte.id, quantity: 2, modifier_option_ids: [] }
        ]
      }
    end

    assert_response :success
    body = response.parsed_body
    assert_equal false, body["can_checkout"]
    assert_equal "item_unavailable", body["checkout_blocked_reason"]
    assert_equal false, body["lines"][0]["available"]
    assert_equal "sold_out", body["lines"][0]["unavailable_reason"]
    assert_equal true, body["lines"][1]["available"]
    assert_equal 27, body["estimated_ready_minutes"]
    assert_equal 10000, body["total_cents"]
  end

  test "preview blocks asap checkout when the shop is closed" do
    travel_to Time.find_zone(@shop.timezone).local(2026, 10, 20, 22, 0, 0) do
      post "/public/shops/#{@shop.id}/cart/preview", params: {
        pickup_type: "asap",
        items: [ { menu_item_id: @latte.id, quantity: 1, modifier_option_ids: [] } ]
      }
    end

    assert_response :success
    assert_equal false, response.parsed_body["can_checkout"]
    assert_equal "shop_closed", response.parsed_body["checkout_blocked_reason"]
    assert_equal "closed", response.parsed_body.dig("ordering", "status")
  end

  test "preview applies a loyalty discount only when the customer can redeem" do
    user = User.create!(email: "preview-loyalty@example.com", password: "password123")
    customer = Customer.create!(user: user, name: "Ana", phone: "5551212121")
    @shop.update!(loyalty_stamps_required: 1, loyalty_reward_text: "Un café gratis")
    order = Order.create!(
      shop: @shop,
      customer: customer,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1_000,
      total_cents: 1_000,
      currency: "MXN",
      pickup_type: "asap"
    )
    order.apply_successful_payment!
    token = JsonWebToken.encode(user_id: user.id)
    items = [
      { menu_item_id: @cookie.id, quantity: 1, modifier_option_ids: [] },
      { menu_item_id: @latte.id, quantity: 1, modifier_option_ids: [] }
    ]

    travel_to Time.find_zone(@shop.timezone).local(2026, 10, 20, 10, 0, 0) do
      post "/public/shops/#{@shop.id}/cart/preview",
        params: { pickup_type: "asap", redeem_loyalty: true, discount_cents: 9_999, items: items },
        headers: { "Authorization" => "Bearer #{token}" }
    end

    assert_response :success
    assert_equal 2_000, response.parsed_body["discount_cents"]
    assert_equal 5_000, response.parsed_body["total_cents"]
    assert_equal true, response.parsed_body.dig("loyalty", "can_redeem")

    post "/public/shops/#{@shop.id}/cart/preview",
      params: { pickup_type: "asap", redeem_loyalty: true, discount_cents: 9_999, items: items }

    assert_equal 0, response.parsed_body["discount_cents"]
    assert_nil response.parsed_body["loyalty"]
  end

  test "preview blocks every pickup type when the shop is not accepting orders" do
    @shop.update!(accepting_pickup: false)

    travel_to Time.find_zone(@shop.timezone).local(2026, 10, 20, 10, 0, 0) do
      post "/public/shops/#{@shop.id}/cart/preview", params: {
        pickup_type: "scheduled",
        items: [ { menu_item_id: @latte.id, quantity: 1, modifier_option_ids: [] } ]
      }
    end

    assert_response :success
    assert_equal false, response.parsed_body["can_checkout"]
    assert_equal "not_accepting", response.parsed_body["checkout_blocked_reason"]
  end
end
