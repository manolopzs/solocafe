class KitchenPushJob < ApplicationJob
  # Wait for the payment transaction so a rolled back arrival does not alert the kitchen.
  self.enqueue_after_transaction_commit = true

  # Sidekiq retried this job on its own. Solid Queue does not, so transient
  # push service failures are retried here. A bad VAPID setup (Unauthorized)
  # is not retried. Expired and invalid subscriptions are pruned before they raise.
  retry_on WebPush::PushServiceError, wait: :polynomially_longer, attempts: 5

  around_enqueue do |job, block|
    block.call
  rescue StandardError => error
    shop_id, device_id = job.arguments
    PaymentLog.error(
      "kitchen_push.enqueue_failed",
      shop_id: shop_id,
      device_id: device_id,
      error_class: error.class.name
    )
  end

  def perform(shop_id, device_id, message)
    shop = Shop.find_by(id: shop_id)
    return if shop.nil?

    Current.set(shop: shop) do
      device = PushDevice.find_by(id: device_id)
      KitchenPush.deliver(device, message) if device
    end
  end
end
