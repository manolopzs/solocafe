class WebPushDelivery
  class << self
    def deliver(device, message)
      unless configured?
        Rails.logger.warn("Kitchen push skipped because VAPID is not configured")
        return :skipped
      end

      WebPush.payload_send(
        message: JSON.generate(message),
        endpoint: device.endpoint,
        p256dh: device.p256dh,
        auth: device.auth_key,
        vapid: {
          subject: subject,
          public_key: public_key,
          private_key: private_key
        },
        urgency: "high",
        ttl: 60 * 60
      )
      :sent
    rescue WebPush::InvalidSubscription, WebPush::ExpiredSubscription
      :gone
    end

    private

    def configured?
      public_key.present? && private_key.present? && subject.match?(/\A(?:mailto:|https:)/)
    end

    def public_key
      ENV["VAPID_PUBLIC_KEY"].to_s
    end

    def private_key
      ENV["VAPID_PRIVATE_KEY"].to_s
    end

    def subject
      ENV["VAPID_SUBJECT"].to_s
    end
  end
end
