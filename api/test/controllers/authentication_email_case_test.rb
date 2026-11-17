require "test_helper"

class AuthenticationEmailCaseTest < ActionDispatch::IntegrationTest
  test "signup strips and downcases the email" do
    post "/auth/signup", params: { user: { email: " Foo@Example.com ", password: "password123" } }, as: :json

    assert_response :created
    assert_equal "foo@example.com", User.last.email
    assert_equal "foo@example.com", response.parsed_body.dig("user", "email")
  end

  test "signup with a case variant of an existing email fails as taken" do
    User.create!(email: "owner@example.com", password: "password123")

    assert_no_difference "User.count" do
      post "/auth/signup", params: { user: { email: "Owner@Example.COM", password: "password123" } }, as: :json
    end

    assert_response :unprocessable_entity
    duplicate = User.new(email: "Owner@Example.COM", password: "password123")
    assert_not duplicate.valid?
    assert duplicate.errors.of_kind?(:email, :taken)
  end

  test "login matches the email regardless of case" do
    User.create!(email: "owner@example.com", password: "password123")

    post "/auth/login", params: { email: " OWNER@example.com ", password: "password123" }, as: :json

    assert_response :ok
    assert response.parsed_body["token"].present?
  end

  test "login still finds rows saved with mixed case before normalization" do
    user = User.create!(email: "legacy@example.com", password: "password123")
    user.update_column(:email, "Legacy@Example.com")

    post "/auth/login", params: { email: "legacy@example.com", password: "password123" }, as: :json

    assert_response :ok
  end
end
