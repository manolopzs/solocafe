require "test_helper"

class WaitlistSignupsControllerTest < ActionDispatch::IntegrationTest
  SUCCESS = "You're on the list. We'll let you know when the iOS app is out.".freeze

  test "create adds a normalized email with its source" do
    assert_difference -> { WaitlistSignup.count }, 1 do
      post "/waitlist", params: { waitlist_signup: { email: "  New.Person@Example.com ", source: "landing" } }, as: :json
    end

    assert_response :ok
    assert_equal SUCCESS, response.parsed_body["message"]
    signup = WaitlistSignup.last
    assert_equal "new.person@example.com", signup.email
    assert_equal "landing", signup.source
  end

  test "create defaults the source to landing" do
    post "/waitlist", params: { waitlist_signup: { email: "nosource@example.com" } }, as: :json

    assert_response :ok
    assert_equal "landing", WaitlistSignup.find_by(email: "nosource@example.com").source
  end

  test "create is idempotent and answers a repeat exactly like a new email" do
    post "/waitlist", params: { waitlist_signup: { email: "repeat@example.com" } }, as: :json
    first = response.parsed_body

    assert_no_difference -> { WaitlistSignup.count } do
      post "/waitlist", params: { waitlist_signup: { email: "REPEAT@example.com" } }, as: :json
    end

    assert_response :ok
    assert_equal first, response.parsed_body
  end

  test "create rejects an invalid email" do
    assert_no_difference -> { WaitlistSignup.count } do
      post "/waitlist", params: { waitlist_signup: { email: "not-an-email" } }, as: :json
    end

    assert_response :unprocessable_entity
    assert_equal [ "Email is invalid" ], response.parsed_body["errors"]
  end

  test "create rejects a blank email" do
    post "/waitlist", params: { waitlist_signup: { email: " " } }, as: :json

    assert_response :unprocessable_entity
    assert_equal [ "Email can't be blank" ], response.parsed_body["errors"]
  end

  test "create rejects a malformed source" do
    post "/waitlist", params: { waitlist_signup: { email: "src@example.com", source: "<script>" } }, as: :json

    assert_response :unprocessable_entity
    assert_equal [ "Source is invalid" ], response.parsed_body["errors"]
  end

  test "create ignores attributes outside the strong params" do
    post "/waitlist", params: { waitlist_signup: { email: "strong@example.com", created_at: "2000-01-01" } }, as: :json

    assert_response :ok
    assert WaitlistSignup.find_by(email: "strong@example.com").created_at > 1.day.ago
  end

  test "create returns 400 without the waitlist_signup key" do
    post "/waitlist", params: { other: { email: "x@example.com" } }, as: :json

    assert_response :bad_request
  end

  test "create returns 429 after too many attempts for the same email" do
    5.times do
      post "/waitlist", params: { waitlist_signup: { email: "busy@example.com" } }, as: :json
    end

    post "/waitlist", params: { waitlist_signup: { email: "busy@example.com" } }, as: :json

    assert_response :too_many_requests
    assert_equal "Too many attempts. Please wait a few minutes and try again.", response.parsed_body["error"]
  end

  test "create returns 429 after too many attempts from the same ip" do
    20.times do |i|
      post "/waitlist", params: { waitlist_signup: { email: "ip#{i}@example.com" } }, as: :json
    end

    post "/waitlist", params: { waitlist_signup: { email: "one-more@example.com" } }, as: :json

    assert_response :too_many_requests
  end
end
