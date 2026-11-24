require "test_helper"

class WaitlistSignupTest < ActiveSupport::TestCase
  test "join! stores the email once, case-insensitively" do
    WaitlistSignup.join!(email: "Once@Example.com")
    WaitlistSignup.join!(email: "once@example.com ")

    assert_equal 1, WaitlistSignup.where(email: "once@example.com").count
  end

  test "join! keeps the first source on a repeat" do
    WaitlistSignup.join!(email: "first@example.com", source: "landing")
    WaitlistSignup.join!(email: "first@example.com", source: "faq")

    assert_equal "landing", WaitlistSignup.find_by(email: "first@example.com").source
  end

  test "join! returns errors and saves nothing for an invalid email" do
    signup = WaitlistSignup.join!(email: "nope")

    assert_includes signup.errors.full_messages, "Email is invalid"
    assert_equal 0, WaitlistSignup.count
  end

  test "rejects emails longer than 254 characters" do
    signup = WaitlistSignup.new(email: "#{"a" * 250}@example.com")

    assert_not signup.valid?
  end
end
