class CustomerReadyPush
  def self.enqueue(order)
    return unless order.status_ready?

    message = message_for(order)
    Current.set(shop: order.shop) do
      PushDevice.where(audience: "customer", order_id: order.id).find_each do |device|
        CustomerReadyPushJob.perform_later(order.shop_id, device.id, message)
      end
    end
  end

  def self.deliver(device, message)
    return unless device&.platform_web?
    return unless device.audience == "customer"

    device.destroy! if WebPushDelivery.deliver(device, message) == :gone
  end

  def self.message_for(order)
    I18n.with_locale(order.shop.locale) do
      {
        "title" => I18n.t("customer_ready_push.title"),
        "body" => I18n.t("customer_ready_push.body"),
        "event" => "order.ready",
        "shop_id" => order.shop_id,
        "order_id" => order.id,
        "url" => "/order/#{order.id}"
      }
    end
  end
end
