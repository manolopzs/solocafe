require "test_helper"

class PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  test "create returns success for unknown email without leaking existence" do
    assert_no_enqueued_emails do
      post "/auth/password_resets", params: { email: "missing@example.com" }, as: :json
    end

    assert_response :ok
    assert_equal "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.", response.parsed_body["message"]
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
  end

  test "update rejects invalid token" do
    patch "/auth/password_resets/not-a-token", params: { password: "newpassword456" }, as: :json

    assert_response :unprocessable_entity
    assert_equal "El enlace de restablecimiento no es válido o ha caducado.", response.parsed_body["error"]
  end

  test "update rejects short password" do
    user = User.create!(email: "owner@example.com", password: "password123")
    token = user.generate_token_for(:password_reset)

    patch "/auth/password_resets/#{token}", params: { password: "short" }, as: :json

    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"].join, "password"
  end
end
