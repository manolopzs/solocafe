require "test_helper"

class StripeConnectControllerTest < ActionDispatch::IntegrationTest
  setup do
    @owner = User.create!(email: "owner-stripe-connect@example.com", password: "password123")
    @shop = Shop.create!(
      name: "Cafe Connect",
      slug: "cafe-connect",
      currency: "EUR",
      status: "draft",
      owner: @owner
    )
    ShopMember.create!(shop: @shop, user: @owner, role: :owner)
    @token = JsonWebToken.encode(user_id: @owner.id)
  end

  test "connect reports stripe as not configured when the secret is a placeholder" do
    previous = ENV["STRIPE_SECRET_KEY"]
    ENV["STRIPE_SECRET_KEY"] = "sk_test_placeholder"

    logs = capture_rails_logs do
      post "/shops/#{@shop.id}/stripe/connect",
        params: {
          refresh_url: "https://example.com/refresh",
          return_url: "https://example.com/return"
        },
        headers: auth(@token),
        as: :json
    end

    assert_response :service_unavailable
    assert_equal "stripe_not_configured", response.parsed_body["error"]
    assert_nil @shop.reload.stripe_account_id
    assert_match(/payment.stripe_not_configured/, logs)
  ensure
    ENV["STRIPE_SECRET_KEY"] = previous
  end

  test "status reports stripe as not configured when the secret is a placeholder" do
    previous = ENV["STRIPE_SECRET_KEY"]
    ENV["STRIPE_SECRET_KEY"] = "sk_test_placeholder"

    post "/shops/#{@shop.id}/stripe/status",
      headers: auth(@token),
      as: :json

    assert_response :service_unavailable
    assert_equal "stripe_not_configured", response.parsed_body["error"]
  ensure
    ENV["STRIPE_SECRET_KEY"] = previous
  end

  private

  def auth(token)
    { "Authorization" => "Bearer #{token}" }
  end
end
