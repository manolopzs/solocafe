require "test_helper"

class Public::OrderPushesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @shop = Shop.create!(name: "Café A", slug: "push-a", currency: "EUR", owner: User.create!(email: "push-owner@example.com", password: "password123"))
    @other = Shop.create!(name: "Café B", slug: "push-b", currency: "EUR")
    @order = Order.create!(
      shop: @shop,
      status: "preparing",
      payment_status: "succeeded",
      subtotal_cents: 280,
      total_cents: 280,
      currency: "EUR",
      pickup_type: "asap"
    )
    @other_order = Order.create!(
      shop: @other,
      status: "preparing",
      payment_status: "succeeded",
      subtotal_cents: 280,
      total_cents: 280,
      currency: "EUR",
      pickup_type: "asap"
    )
  end

  test "a guest token registers a customer device for that order only" do
    post "/public/orders/#{@order.id}/push_devices", params: {
      token: @order.guest_access_token,
      push_device: {
        endpoint: "https://push.example/order",
        keys: { p256dh: "p256", auth: "authkey" }
      }
    }, as: :json

    assert_response :created
    device = TenantScoped.unscoped_for_system { PushDevice.find(response.parsed_body.dig("push_device", "id")) }
    assert_equal "customer", device.audience
    assert_equal @order.id, device.order_id
    assert_equal @shop.id, device.shop_id

    post "/public/orders/#{@other_order.id}/push_devices", params: {
      token: @order.guest_access_token,
      push_device: {
        endpoint: "https://push.example/stolen",
        keys: { p256dh: "p256", auth: "authkey" }
      }
    }, as: :json

    assert_response :forbidden
    assert_equal 0, TenantScoped.unscoped_for_system { PushDevice.where(order_id: @other_order.id).count }
  end
end
