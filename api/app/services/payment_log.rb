class PaymentLog
  def self.error(event, **details)
    write(:error, event, details)
  end

  def self.warn(event, **details)
    write(:warn, event, details)
  end

  def self.write(level, event, details)
    payload = { source: "payments", event: event }.merge(details.compact)
    Rails.logger.public_send(level, payload.to_json)
  end
  private_class_method :write
end
