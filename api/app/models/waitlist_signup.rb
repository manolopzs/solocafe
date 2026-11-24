class WaitlistSignup < ApplicationRecord
  SOURCE_FORMAT = /\A[a-z0-9_-]{1,40}\z/

  normalizes :email, with: ->(email) { email.strip.downcase }
  normalizes :source, with: ->(source) { source.strip.downcase }

  # No uniqueness validation on purpose: it would tell the caller the email is already on the list.
  # The unique index plus insert-or-ignore in .join! keeps repeats idempotent instead.
  validates :email, presence: true, length: { maximum: 254 },
    format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }
  validates :source, format: { with: SOURCE_FORMAT }

  # Adds the email once. Returns the unsaved record so callers can read validation errors,
  # and returns the same result whether or not the email was already on the list.
  def self.join!(email:, source: nil)
    signup = new(email: email.to_s, source: source.presence || "landing")
    return signup unless signup.valid?

    now = Time.current
    insert_all(
      [ { email: signup.email, source: signup.source, created_at: now, updated_at: now } ],
      unique_by: :email
    )
    signup
  end
end
