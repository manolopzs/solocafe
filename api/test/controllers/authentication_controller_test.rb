require "test_helper"

# Owner signup (/auth/signup) and customer signup (/account/signup in the
# frontend) both post to this endpoint.
class AuthenticationControllerTest < ActionDispatch::IntegrationTest
  test "signup with an existing email returns a Spanish message and email_taken code" do
    User.create!(email: "owner@example.com", password: "password123")

    assert_no_difference "User.count" do
      post "/auth/signup", params: { user: { email: "owner@example.com", password: "password123" } }, as: :json
    end

    assert_response :unprocessable_entity
    body = response.parsed_body
    assert_equal "email_taken", body["code"]
    assert_equal({ "email" => [ "taken" ] }, body["error_codes"])
    assert_equal [ "Email ya está en uso" ], body["errors"]
    assert_not_includes response.body, "Translation missing"
  end

  test "signup with blank email and short password returns Spanish messages without a code" do
    post "/auth/signup", params: { user: { email: "", password: "short" } }, as: :json

    assert_response :unprocessable_entity
    body = response.parsed_body
    assert_nil body["code"]
    assert_includes body["errors"], "Email no puede estar en blanco"
    assert_includes body["errors"], "Contraseña es demasiado corta (mínimo 8 caracteres)"
    assert_equal [ "blank" ], body["error_codes"]["email"]
    assert_equal [ "too_short" ], body["error_codes"]["password"]
    assert_not_includes response.body, "Translation missing"
  end

  test "signup with a new email still creates the user" do
    assert_difference "User.count", 1 do
      post "/auth/signup", params: { user: { email: "new@example.com", password: "password123" } }, as: :json
    end

    assert_response :created
    assert response.parsed_body["token"].present?
  end

  test "login returns 429 after too many attempts for the same email" do
    User.create!(email: "locked@example.com", password: "password123")

    10.times do
      post "/auth/login", params: { email: "locked@example.com", password: "wrong" }, as: :json
    end

    post "/auth/login", params: { email: "locked@example.com", password: "wrong" }, as: :json

    assert_response :too_many_requests
    assert_equal "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.", response.parsed_body["error"]
  end

  test "login still allows a different email when one is rate limited" do
    User.create!(email: "locked@example.com", password: "password123")
    User.create!(email: "other@example.com", password: "password123")

    11.times do
      post "/auth/login", params: { email: "locked@example.com", password: "wrong" }, as: :json
    end
    assert_response :too_many_requests

    post "/auth/login", params: { email: "other@example.com", password: "password123" }, as: :json

    assert_response :success
    assert response.parsed_body["token"].present?
  end

  test "signup returns 429 after too many attempts from the same IP" do
    20.times do |i|
      post "/auth/signup", params: { user: { email: "signup#{i}@example.com", password: "password123" } }, as: :json
    end

    post "/auth/signup", params: { user: { email: "signup21@example.com", password: "password123" } }, as: :json

    assert_response :too_many_requests
    assert_equal "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.", response.parsed_body["error"]
  end
end
