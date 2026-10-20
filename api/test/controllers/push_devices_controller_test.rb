require "test_helper"

class PushDevicesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner@example.com", password: "password123")
    @other_user = User.create!(email: "other@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe A", slug: "cafe-a", currency: "MXN", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe B", slug: "cafe-b", currency: "MXN", owner: @other_user)
    ShopMember.create!(shop: @shop, user: @owner, role: :owner)
    ShopMember.create!(shop: @other_shop, user: @other_user, role: :owner)
    @token = JsonWebToken.encode(user_id: @owner.id)
  end

  test "staff can register a web push subscription and refresh its keys" do
    post shop_push_devices_url(@shop), params: web_params, headers: auth_headers, as: :json
    assert_response :created
    device_id = response.parsed_body.dig("push_device", "id")
    assert_equal "web", response.parsed_body.dig("push_device", "platform")
    assert_equal "https://push.example/device", response.parsed_body.dig("push_device", "endpoint")
    assert_nil response.parsed_body.dig("push_device", "p256dh")

    refreshed = web_params
    refreshed[:push_device][:keys][:auth] = "updated-auth"
    post shop_push_devices_url(@shop), params: refreshed, headers: auth_headers, as: :json
    assert_response :ok
    assert_equal device_id, response.parsed_body.dig("push_device", "id")
    assert_equal 1, TenantScoped.unscoped_for_system { PushDevice.where(shop: @shop, platform: "web").count }
    assert_equal "updated-auth", TenantScoped.unscoped_for_system { PushDevice.find(device_id).auth_key }
  end

  test "staff can register an expo token" do
    post shop_push_devices_url(@shop),
      params: { push_device: { platform: "expo", token: "ExponentPushToken[abc]" } },
      headers: auth_headers,
      as: :json
    assert_response :created
    assert_equal "ExponentPushToken[abc]", response.parsed_body.dig("push_device", "token")
    assert_nil response.parsed_body.dig("push_device", "endpoint")
  end

  test "web registration without keys is rejected" do
    post shop_push_devices_url(@shop),
      params: { push_device: { platform: "web", endpoint: "https://push.example/device" } },
      headers: auth_headers,
      as: :json
    assert_response :unprocessable_entity
    assert_equal 0, TenantScoped.unscoped_for_system { PushDevice.count }
  end

  test "devices stay inside the shop" do
    Current.shop = @other_shop
    foreign = PushDevice.register!(
      shop: @other_shop,
      user: @other_user,
      attributes: {
        platform: "expo",
        token: "ExponentPushToken[other]"
      }
    )

    get shop_push_devices_url(@shop), headers: auth_headers
    assert_response :success
    assert_empty response.parsed_body["push_devices"]

    delete shop_push_device_url(@shop, foreign), headers: auth_headers
    assert_response :not_found
    assert TenantScoped.unscoped_for_system { PushDevice.exists?(foreign.id) }

    post shop_push_devices_url(@other_shop),
      params: { push_device: { platform: "expo", token: "ExponentPushToken[nope]" } },
      headers: auth_headers,
      as: :json
    assert_response :forbidden
    assert_not TenantScoped.unscoped_for_system { PushDevice.exists?(token: "ExponentPushToken[nope]") }
  end

  private

  def auth_headers
    { "Authorization" => "Bearer #{@token}" }
  end

  def web_params
    {
      push_device: {
        platform: "web",
        endpoint: "https://push.example/device",
        keys: { p256dh: "public-key", auth: "auth-secret" }
      }
    }
  end
end
