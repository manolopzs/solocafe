require "test_helper"

class EmailLoginCodeTest < ActiveSupport::TestCase
  setup do
    @user = User.create!(email: "code@example.com", password: "password123")
  end

  test "issue_for! returns a six digit code and stores only its digest" do
    record, code = EmailLoginCode.issue_for!(@user)

    assert_match(/\A\d{6}\z/, code)
    assert_equal 64, record.code_digest.bytesize
    assert_not_equal code, record.code_digest
    assert_equal EmailLoginCode.digest_for(code), record.code_digest
    assert_not record.respond_to?(:code)
  end

  test "issue_for! invalidates prior active codes" do
    first_record, first_code = EmailLoginCode.issue_for!(@user)
    second_record, second_code = EmailLoginCode.issue_for!(@user)

    assert first_record.reload.consumed_at.present?
    assert_nil second_record.consumed_at
    assert_not EmailLoginCode.verify_for(@user, first_code)
    assert EmailLoginCode.verify_for(@user, second_code)
  end

  test "codes expire after ten minutes" do
    record, code = EmailLoginCode.issue_for!(@user)
    assert_in_delta 10.minutes, record.expires_at - Time.current, 1.second

    travel 11.minutes do
      assert_not EmailLoginCode.verify_for(@user, code)
    end
  end

  test "a matching code is consumed and cannot be reused" do
    record, code = EmailLoginCode.issue_for!(@user)

    assert EmailLoginCode.verify_for(@user, " #{code} ")
    assert record.reload.consumed_at.present?
    assert_not EmailLoginCode.verify_for(@user, code)
  end

  test "five mismatches permanently lock out the code" do
    record, code = EmailLoginCode.issue_for!(@user)
    wrong_code = format("%06d", (code.to_i + 1) % 1_000_000)

    EmailLoginCode::MAX_ATTEMPTS.times do |attempt|
      assert_not EmailLoginCode.verify_for(@user, wrong_code)
      assert_equal attempt + 1, record.reload.attempts
    end

    assert record.consumed_at.present?
    assert_not EmailLoginCode.verify_for(@user, code)
  end

  test "a mismatch uses constant time digest comparison and increments attempts" do
    record, = EmailLoginCode.issue_for!(@user)
    compared = false
    compared_args = nil
    comparator = lambda do |left, right|
      compared = true
      compared_args = [left, right]
      false
    end

    original = ActiveSupport::SecurityUtils.method(:secure_compare)
    ActiveSupport::SecurityUtils.define_singleton_method(:secure_compare, comparator)
    begin
      assert_not EmailLoginCode.verify_for(@user, "000000")
    ensure
      ActiveSupport::SecurityUtils.define_singleton_method(:secure_compare, original)
    end

    assert_equal 64, compared_args[0].bytesize
    assert_equal compared_args[0].bytesize, compared_args[1].bytesize
    assert compared
    assert_equal 1, record.reload.attempts
    assert_nil record.consumed_at
  end

  test "malformed codes are rejected without changing the record" do
    record, = EmailLoginCode.issue_for!(@user)

    [nil, "", "12345", "1234567", "abcdef", "12345a"].each do |submitted_code|
      assert_not EmailLoginCode.verify_for(@user, submitted_code)
    end

    assert_equal 0, record.reload.attempts
    assert_nil record.consumed_at
  end

  test "verification rejects a missing user" do
    assert_not EmailLoginCode.verify_for(nil, "123456")
  end
end
