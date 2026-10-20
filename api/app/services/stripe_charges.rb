class StripeCharges
  def self.id_of(value)
    return if value.nil?
    return value if value.is_a?(String)

    StripePayload.read(value, :id).presence
  end

  def self.matches_order?(payment_intent, order)
    amount = StripePayload.read(payment_intent, :amount)
    currency = StripePayload.read(payment_intent, :currency).to_s
    payment_intent_id = id_of(payment_intent)

    if amount.nil? || currency.blank? || amount.to_i != order.total_cents || currency.downcase != order.currency.downcase
      PaymentLog.error(
        "payment.amount_mismatch",
        order_id: order.id,
        shop_id: order.shop_id,
        payment_intent_id: payment_intent_id,
        expected_cents: order.total_cents,
        actual_cents: amount,
        currency: currency.presence
      )
      return false
    end

    fee = StripePayload.read(payment_intent, :application_fee_amount)
    return true if fee.nil?

    expected_fee = StripeFees.application_fee_cents(order.total_cents)
    return true if fee.to_i == expected_fee

    PaymentLog.error(
      "payment.fee_mismatch",
      order_id: order.id,
      shop_id: order.shop_id,
      payment_intent_id: payment_intent_id,
      expected_fee_cents: expected_fee,
      actual_fee_cents: fee.to_i
    )
    false
  end
end
