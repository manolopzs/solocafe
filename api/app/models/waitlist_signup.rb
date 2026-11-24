class WaitlistSignup < ApplicationRecord
  normalizes :email, with: ->(email) { email.strip.downcase }
  normalizes :source, with: ->(source) { source.strip.downcase }

  validates :email, presence: true, length: { maximum: 254 }, format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }
  validates :source, format: { with: /\A[a-z0-9_-]{1,40}\z/ }

  def self.join!(email:, source: nil)
    signup = new(email: email)
    signup.source = source unless source.nil?
    return signup unless signup.valid?

    timestamp = Time.current
    insert_all(
      [signup.attributes.slice("email", "source").merge("created_at" => timestamp, "updated_at" => timestamp)],
      unique_by: :email
    )

    find_by!(email: signup.email)
  end
end
