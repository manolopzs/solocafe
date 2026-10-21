class CustomerReadyPushJob < ApplicationJob
  # Wait until the status change commits so a rolled back ready state does not ping the customer.
  self.enqueue_after_transaction_commit = true

  # Solid Queue does not retry on its own. Transient push failures are retried here.
  retry_on WebPush::PushServiceError, wait: :polynomially_longer, attempts: 5

  def perform(shop_id, device_id, message)
    shop = Shop.find_by(id: shop_id)
    return if shop.nil?

    Current.set(shop: shop) do
      device = PushDevice.find_by(id: device_id)
      CustomerReadyPush.deliver(device, message) if device
    end
  end
end
