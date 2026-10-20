class StripeFees
  def self.application_fee_cents(total_cents)
    total = total_cents.to_i
    return 0 if total <= 0

    percent = ENV.fetch("PLATFORM_FEE_PERCENT", "0").to_r
    fee = (total * percent / 100).round
    fee = 0 if fee.negative?
    [ fee, total ].min
  end
end
