module StripeConfig
  PLACEHOLDER = /placeholder|changeme|your_stripe|xxx/i

  def self.configured?(key = ENV["STRIPE_SECRET_KEY"])
    value = key.to_s.strip
    return false if value.empty? || PLACEHOLDER.match?(value)

    value.match?(/\A(sk|rk)_(test|live)_[A-Za-z0-9]{16,}\z/)
  end
end

Stripe.api_key = ENV["STRIPE_SECRET_KEY"] if StripeConfig.configured?
