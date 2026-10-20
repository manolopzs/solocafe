class KitchenPushJob < ApplicationJob
  # Wait for the payment transaction so a rolled back arrival does not alert the kitchen.
  self.enqueue_after_transaction_commit = true

  def perform(shop_id, device_id, message)
    shop = Shop.find_by(id: shop_id)
    return if shop.nil?

    Current.set(shop: shop) do
      device = PushDevice.find_by(id: device_id)
      KitchenPush.deliver(device, message) if device
    end
  end
end
