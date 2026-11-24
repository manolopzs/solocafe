require "test_helper"

class WaitlistSignupTest < ActiveSupport::TestCase
  test "join deduplicates emails without regard to case" do
    first = WaitlistSignup.join!(email: "Person@Example.com", source: "landing")

    assert_no_difference "WaitlistSignup.count" do
      second = WaitlistSignup.join!(email: " person@example.COM ", source: "social")
      assert_equal first.id, second.id
    end
  end

  test "join keeps the first source for repeat signups" do
    WaitlistSignup.join!(email: "source@example.com", source: "landing")

    repeat = WaitlistSignup.join!(email: "SOURCE@example.com", source: "social")

    assert_equal "landing", repeat.source
  end

  test "email is limited to 254 characters" do
    valid = WaitlistSignup.new(email: "#{'a' * 242}@example.com")
    invalid = WaitlistSignup.new(email: "#{'a' * 243}@example.com")

    assert valid.valid?
    assert_not invalid.valid?
    assert invalid.errors.added?(:email, :too_long, count: 254)
  end
end
