class EmailLoginCode < ApplicationRecord
  belongs_to :user

  EXPIRY = 10.minutes
  MAX_ATTEMPTS = 5
  CODE_FORMAT = /\A\d{6}\z/

  def self.issue_for!(user)
    code = SecureRandom.random_number(1_000_000).to_s.rjust(6, "0")

    transaction do
      now = Time.current
      user.email_login_codes.where(consumed_at: nil).update_all(consumed_at: now)
      record = user.email_login_codes.create!(
        code_digest: digest_for(code),
        expires_at: EXPIRY.from_now
      )
      [record, code]
    end
  end

  def self.verify_for(user, submitted_code)
    return false unless user

    code = submitted_code.to_s.strip
    return false unless CODE_FORMAT.match?(code)

    transaction do
      record = user.email_login_codes.where(consumed_at: nil).order(created_at: :desc).lock.first
      next false unless record

      now = Time.current
      next false if record.expires_at <= now || record.attempts >= MAX_ATTEMPTS

      digest = digest_for(code)
      matches = digest.bytesize == record.code_digest.bytesize &&
        ActiveSupport::SecurityUtils.secure_compare(digest, record.code_digest)

      if matches
        record.update!(consumed_at: now)
        true
      else
        attempts = record.attempts + 1
        record.update!(attempts: attempts, consumed_at: attempts >= MAX_ATTEMPTS ? now : nil)
        false
      end
    end
  end

  def self.digest_for(code)
    OpenSSL::HMAC.hexdigest("SHA256", hmac_secret, code)
  end

  def self.hmac_secret
    key_generator = Rails.application.key_generator
    return key_generator.generate_key("email_login_code") if key_generator

    Rails.application.secret_key_base
  end
  private_class_method :hmac_secret
end
