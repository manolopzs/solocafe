class KitchenPush
  def self.enqueue(order)
    message = message_for(order)
    Current.set(shop: order.shop) do
      PushDevice.where(audience: "kitchen").find_each do |device|
        KitchenPushJob.perform_later(order.shop_id, device.id, message)
      end
    end
  end

  def self.deliver(device, message)
    # Expo tokens stay registered. Native apps will reuse this message later.
    return unless device.platform_web?

    device.destroy! if WebPushDelivery.deliver(device, message) == :gone
  end

  def self.message_for(order)
    I18n.with_locale(order.shop.locale) do
      {
        "title" => I18n.t("kitchen_push.title"),
        "body" => I18n.t("kitchen_push.body"),
        "event" => "order.kitchen_new",
        "shop_id" => order.shop_id,
        "order_id" => order.id
      }
    end
  end
end
