require "test_helper"

class AuthCodesControllerTest < ActionDispatch::IntegrationTest
  setup do
    ActionMailer::Base.deliveries.clear
  end

  test "request returns a neutral response for an unknown email without enqueueing email" do
    assert_no_enqueued_emails do
      post "/auth/code/request", params: { email: "missing@example.com" }, as: :json
    end

    assert_response :ok
    assert_equal neutral_message, response.parsed_body["message"]
  end

  test "request sends a code email for a known customer with the account login link without enqueueing jobs" do
    user = User.create!(email: "customer@example.com", password: "password123")

    with_env("APP_URL" => "https://app.example.com") do
      assert_emails 1 do
        assert_no_enqueued_jobs do
          post "/auth/code/request", params: { email: user.email, from: "account" }, as: :json
        end
      end
    end

    assert_response :ok
    assert_equal neutral_message, response.parsed_body["message"]
    mail = ActionMailer::Base.deliveries.last
    assert_equal "Your Solo Cafe login code", mail.subject
    body = mail.body.decoded
    code = body[/\b(\d{6})\b/, 1]
    assert_not_nil code
    assert_includes body, code
    assert_includes body, "expires in 10 minutes"
    assert_includes body, "https://app.example.com/account/login"
    assert_includes body, "The Solo Cafe team"
  end

  test "request sends a code email for a known owner with the owner login link" do
    user = User.create!(email: "owner@example.com", password: "password123", role: "admin")

    with_env("APP_URL" => "https://app.example.com") do
      assert_emails 1 do
        post "/auth/code/request", params: { email: user.email }, as: :json
      end
    end

    assert_response :ok
    assert_includes ActionMailer::Base.deliveries.last.body.decoded, "https://app.example.com/auth/login"
  end

  test "request matches emails case insensitively" do
    User.create!(email: "owner@example.com", password: "password123")

    assert_emails 1 do
      post "/auth/code/request", params: { email: " Owner@Example.com " }, as: :json
    end

    assert_response :ok
  end

  test "verify filters the code from request logs" do
    post "/auth/code/verify", params: { email: "missing@example.com", code: "123456" }, as: :json

    assert_response :unauthorized
    assert_equal "[FILTERED]", request.filtered_parameters["code"]
    assert_not_equal "123456", request.filtered_parameters["code"]
  end

  test "request rejects blank and malformed email addresses" do
    ["", "not-an-email"].each do |email|
      post "/auth/code/request", params: { email: email }, as: :json

      assert_response :unprocessable_entity
      assert_equal "Enter a valid email address.", response.parsed_body["error"]
    end
  end

  test "request rate limits each email after five requests" do
    User.create!(email: "limited@example.com", password: "password123")

    5.times do
      post "/auth/code/request", params: { email: "limited@example.com" }, as: :json
      assert_response :ok
    end

    post "/auth/code/request", params: { email: "LIMITED@example.com" }, as: :json

    assert_response :too_many_requests
    assert_equal rate_limit_message, response.parsed_body["error"]
  end

  test "request rate limits each IP after twenty requests" do
    20.times do |index|
      post "/auth/code/request", params: { email: "visitor#{index}@example.com" }, as: :json
      assert_response :ok
    end

    post "/auth/code/request", params: { email: "one-more@example.com" }, as: :json

    assert_response :too_many_requests
    assert_equal rate_limit_message, response.parsed_body["error"]
  end

  test "verify returns the same customer payload and token version as password login" do
    user = User.create!(email: "customer@example.com", password: "password123")
    Customer.create!(user: user, name: "Ada", phone: "123456789")

    assert_code_login_matches_password_login(user)
  end

  test "verify returns the same owner payload and token version as password login" do
    user = User.create!(email: "owner@example.com", password: "password123", role: "admin")

    assert_code_login_matches_password_login(user)
  end

  test "verify consumes a code so it cannot be reused" do
    user = User.create!(email: "single@example.com", password: "password123")
    _record, code = EmailLoginCode.issue_for!(user)

    post "/auth/code/verify", params: { email: user.email, code: code }, as: :json
    assert_response :ok

    post "/auth/code/verify", params: { email: user.email, code: code }, as: :json
    assert_response :unauthorized
    assert_equal invalid_code_message, response.parsed_body["error"]
  end

  test "verify rejects an expired code" do
    user = User.create!(email: "expired@example.com", password: "password123")
    _record, code = EmailLoginCode.issue_for!(user)

    travel 11.minutes do
      post "/auth/code/verify", params: { email: user.email, code: code }, as: :json
    end

    assert_response :unauthorized
    assert_equal invalid_code_message, response.parsed_body["error"]
  end

  test "verify increments attempts and rejects the real code after five failures" do
    user = User.create!(email: "attempts@example.com", password: "password123")
    record, code = EmailLoginCode.issue_for!(user)
    wrong_code = format("%06d", (code.to_i + 1) % 1_000_000)

    5.times do
      post "/auth/code/verify", params: { email: user.email, code: wrong_code }, as: :json
      assert_response :unauthorized
    end

    assert_equal 5, record.reload.attempts
    assert record.consumed_at.present?

    post "/auth/code/verify", params: { email: user.email, code: code }, as: :json
    assert_response :unauthorized
    assert_equal invalid_code_message, response.parsed_body["error"]
  end

  test "verify returns the same unauthorized response for an unknown email" do
    post "/auth/code/verify", params: { email: "missing@example.com", code: "123456" }, as: :json

    assert_response :unauthorized
    assert_equal({ "error" => invalid_code_message }, response.parsed_body)
  end

  test "verify rate limits each email after ten requests" do
    10.times do
      post "/auth/code/verify", params: { email: "limited@example.com", code: "000000" }, as: :json
      assert_response :unauthorized
    end

    post "/auth/code/verify", params: { email: "LIMITED@example.com", code: "000000" }, as: :json

    assert_response :too_many_requests
    assert_equal rate_limit_message, response.parsed_body["error"]
  end

  test "verify rate limits each IP after thirty requests" do
    30.times do |index|
      post "/auth/code/verify", params: { email: "visitor#{index}@example.com", code: "000000" }, as: :json
      assert_response :unauthorized
    end

    post "/auth/code/verify", params: { email: "one-more@example.com", code: "000000" }, as: :json

    assert_response :too_many_requests
    assert_equal rate_limit_message, response.parsed_body["error"]
  end

  test "password login remains available" do
    user = User.create!(email: "password@example.com", password: "password123")

    post "/auth/login", params: { email: user.email, password: "password123" }, as: :json

    assert_response :ok
    assert response.parsed_body["token"].present?
    assert_equal user.id, response.parsed_body.dig("user", "id")
  end

  private

  def assert_code_login_matches_password_login(user)
    _record, code = EmailLoginCode.issue_for!(user)
    post "/auth/code/verify", params: { email: user.email, code: code }, as: :json

    assert_response :ok
    code_body = response.parsed_body
    token_payload = JsonWebToken.decode(code_body["token"])
    assert_equal user.token_version, token_payload["tv"]

    post "/auth/login", params: { email: user.email, password: "password123" }, as: :json

    assert_response :ok
    assert_equal response.parsed_body["user"], code_body["user"]
  end

  def neutral_message
    "If that email exists, we sent a 6-digit login code."
  end

  def invalid_code_message
    "Invalid or expired code."
  end

  def rate_limit_message
    "Too many attempts. Please wait a few minutes and try again."
  end

  def with_env(values)
    previous = values.keys.index_with { |key| ENV[key] }
    values.each { |key, value| value.nil? ? ENV.delete(key) : ENV[key] = value }
    yield
  ensure
    previous.each { |key, value| value.nil? ? ENV.delete(key) : ENV[key] = value }
  end
end
