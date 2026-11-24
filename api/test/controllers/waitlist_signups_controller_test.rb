require "test_helper"

class WaitlistSignupsControllerTest < ActionDispatch::IntegrationTest
  SUCCESS_MESSAGE = "You're on the list. We'll let you know when the iOS app is out."

  test "create normalizes email and source" do
    assert_difference "WaitlistSignup.count", 1 do
      post "/waitlist", params: { waitlist_signup: { email: " Person@Example.COM ", source: " Instagram " } }, as: :json
    end

    assert_response :ok
    assert_equal SUCCESS_MESSAGE, response.parsed_body["message"]
    signup = WaitlistSignup.last
    assert_equal "person@example.com", signup.email
    assert_equal "instagram", signup.source
  end

  test "create uses the default source" do
    post "/waitlist", params: { waitlist_signup: { email: "default@example.com" } }, as: :json

    assert_response :ok
    assert_equal "landing", WaitlistSignup.find_by!(email: "default@example.com").source
  end

  test "repeat create is idempotent and returns an identical response" do
    params = { waitlist_signup: { email: "repeat@example.com", source: "landing" } }
    post "/waitlist", params: params, as: :json
    first_body = response.parsed_body

    assert_no_difference "WaitlistSignup.count" do
      post "/waitlist", params: params, as: :json
    end

    assert_response :ok
    assert_equal first_body, response.parsed_body
    assert_equal({ "message" => SUCCESS_MESSAGE }, response.parsed_body)
  end

  test "create rejects an invalid email" do
    post "/waitlist", params: { waitlist_signup: { email: "not-an-email" } }, as: :json

    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"], "Email is invalid"
  end

  test "create rejects a blank email" do
    post "/waitlist", params: { waitlist_signup: { email: "" } }, as: :json

    assert_response :unprocessable_entity
    assert_equal [ "Email can't be blank" ], response.parsed_body["errors"]
  end

  test "create rejects a missing email key" do
    post "/waitlist", params: { waitlist_signup: { source: "landing" } }, as: :json

    assert_response :unprocessable_entity
    assert_equal [ "Email can't be blank" ], response.parsed_body["errors"]
  end

  test "create rejects a malformed source" do
    post "/waitlist", params: { waitlist_signup: { email: "source@example.com", source: "not valid!" } }, as: :json

    assert_response :unprocessable_entity
    assert_includes response.parsed_body["errors"], "Source is invalid"
  end

  test "create ignores extra attributes" do
    assert_difference "WaitlistSignup.count", 1 do
      post "/waitlist", params: {
        waitlist_signup: { email: "params@example.com", role: "admin", created_at: 1.year.ago }
      }, as: :json
    end

    assert_response :ok
    assert_not WaitlistSignup.last.respond_to?(:role)
    assert WaitlistSignup.last.created_at > 1.minute.ago
  end

  test "create requires the root key" do
    post "/waitlist", params: { other: { email: "x@example.com" } }, as: :json

    assert_response :bad_request
  end

  test "create accepts a top-level email through params wrapping" do
    post "/waitlist", params: { email: "wrapped@example.com" }, as: :json

    assert_response :ok
  end

  test "create rate limits attempts per email" do
    5.times do
      post "/waitlist", params: { waitlist_signup: { email: "LIMIT@example.com" } }, as: :json
      assert_response :ok
    end

    post "/waitlist", params: { waitlist_signup: { email: "limit@example.com" } }, as: :json

    assert_response :too_many_requests
  end

  test "create rate limits attempts per IP" do
    20.times do |index|
      post "/waitlist", params: { waitlist_signup: { email: "visitor#{index}@example.com" } }, as: :json
      assert_response :ok
    end

    post "/waitlist", params: { waitlist_signup: { email: "one-more@example.com" } }, as: :json

    assert_response :too_many_requests
  end
end
