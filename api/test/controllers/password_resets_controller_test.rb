require "test_helper"

class PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  test "create returns success for unknown email without leaking existence" do
    assert_no_enqueued_emails do
      post "/auth/password_resets", params: { email: "missing@example.com" }, as: :json
    end

    assert_response :ok
    assert_equal "If that email exists, you will receive password reset instructions.", response.parsed_body["message"]
  end

  test "create enqueues reset email for known user" do
    user = User.create!(email: "owner@example.com", password: "password123")

    assert_enqueued_emails 1 do
      post "/auth/password_resets", params: { email: user.email }, as: :json
    end

    assert_response :ok
  end

  test "update resets password with valid token" do
    user = User.create!(email: "owner@example.com", password: "password123")
    token = user.generate_token_for(:password_reset)

    patch "/auth/password_resets/#{token}", params: { password: "newpassword456" }, as: :json

    assert_response :ok
    assert user.reload.authenticate("newpassword456")
    assert_equal "customer", response.parsed_body["account"]
  end

  test "update tells the frontend when the account owns a shop" do
    user = User.create!(email: "owner@example.com", password: "password123")
    Shop.create!(name: "Café Norte", slug: "reset-norte", currency: "EUR", locale: "es", owner: user)
    token = user.generate_token_for(:password_reset)

    patch "/auth/password_resets/#{token}", params: { password: "newpassword456" }, as: :json

    assert_response :ok
    assert_equal "owner", response.parsed_body["account"]
  end

  test "create keeps from=account in the emailed reset link" do
    User.create!(email: "guest@example.com", password: "password123")

    perform_enqueued_jobs do
      post "/auth/password_resets", params: { email: "guest@example.com", from: "account" }, as: :json
    end

    assert_includes ActionMailer::Base.deliveries.last.body.encoded, "from=account"
  end

  test "create leaves the owner reset link without from" do
    User.create!(email: "owner@example.com", password: "password123")

    perform_enqueued_jobs do
      post "/auth/password_resets", params: { email: "owner@example.com", from: "elsewhere" }, as: :json
    end

    assert_not_includes ActionMailer::Base.deliveries.last.body.encoded, "from="
  end

  test "create finds the user regardless of email case" do
    User.create!(email: "owner@example.com", password: "password123")

    assert_enqueued_emails 1 do
      post "/auth/password_resets", params: { email: " Owner@Example.com " }, as: :json
    end

    assert_response :ok
  end

  test "create returns 429 after too many attempts for the same email" do
    User.create!(email: "reset@example.com", password: "password123")

    5.times do
      post "/auth/password_resets", params: { email: "reset@example.com" }, as: :json
    end

    post "/auth/password_resets", params: { email: "reset@example.com" }, as: :json

    assert_response :too_many_requests
    assert_equal "Too many attempts. Please wait a few minutes and try again.", response.parsed_body["error"]
  end

  test "update rejects invalid token" do
    patch "/auth/password_resets/not-a-token", params: { password: "newpassword456" }, as: :json

    assert_response :unprocessable_entity
    assert_equal "The reset link is invalid or has expired.", response.parsed_body["error"]
  end

  test "update rejects short password" do
    user = User.create!(email: "owner@example.com", password: "password123")
    token = user.generate_token_for(:password_reset)

    patch "/auth/password_resets/#{token}", params: { password: "short" }, as: :json

    assert_response :unprocessable_entity
    assert_equal [ "Password is too short (minimum 8 characters)" ], response.parsed_body["errors"]
  end

  test "update revokes existing jwt sessions" do
    user = User.create!(email: "owner@example.com", password: "password123")
    jwt_token = JsonWebToken.encode(user_id: user.id, tv: user.token_version)
    reset_token = user.generate_token_for(:password_reset)

    patch "/auth/password_resets/#{reset_token}", params: { password: "newpassword456" }, as: :json

    assert_response :ok
    get "/auth/me", headers: { "Authorization" => "Bearer #{jwt_token}" }
    assert_response :unauthorized
  end

  test "update rejects a token that has already been used" do
    user = User.create!(email: "owner@example.com", password: "password123")
    token = user.generate_token_for(:password_reset)

    patch "/auth/password_resets/#{token}", params: { password: "newpassword456" }, as: :json
    assert_response :ok

    patch "/auth/password_resets/#{token}", params: { password: "anotherpassword789" }, as: :json
    assert_response :unprocessable_entity
    assert_equal "The reset link is invalid or has expired.", response.parsed_body["error"]
  end
end
