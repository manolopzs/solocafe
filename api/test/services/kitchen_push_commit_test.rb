require "test_helper"

class RaisingQueueAdapter
  def enqueue(*)
    raise "queue unavailable"
  end

  def enqueue_at(*)
    raise "queue unavailable"
  end
end

class KitchenPushCommitTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  self.use_transactional_tests = false

  setup do
    @suffix = SecureRandom.hex(4)
    @owner = User.create!(email: "commit-#{@suffix}@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe #{@suffix}", slug: "cafe-#{@suffix}", currency: "MXN", owner: @owner)
    @order = Order.create!(
      shop: @shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1800,
      total_cents: 1800,
      currency: "MXN",
      pickup_type: "asap"
    )
    Current.set(shop: @shop) do
      @device = PushDevice.register!(
        shop: @shop,
        user: @owner,
        attributes: {
          platform: "web",
          endpoint: "https://push.example/#{@suffix}",
          p256dh: "p256dh",
          auth_key: "auth"
        }
      )
    end
    @previous_adapter = ActiveJob::Base.queue_adapter
  end

  teardown do
    ActiveJob::Base.queue_adapter = @previous_adapter if @previous_adapter
    Current.shop = @shop
    TenantScoped.unscoped_for_system do
      order_ids = Order.where(shop_id: @shop.id).select(:id)
      Payment.where(order_id: order_ids).delete_all
      Event.where(shop_id: @shop.id).delete_all
      PushDevice.where(shop_id: @shop.id).delete_all
      Order.where(shop_id: @shop.id).delete_all
      @shop.delete
      @owner.delete
    end
    Current.shop = nil
  end

  test "a committed payment survives a deferred enqueue failure" do
    assert KitchenPushJob.enqueue_after_transaction_commit
    ActiveJob::Base.queue_adapter = RaisingQueueAdapter.new

    assert_nothing_raised do
      Order.transaction do
        @order.apply_successful_payment!
      end
    end

    @order.reload
    assert_equal "received", @order.status
    assert_equal "succeeded", @order.payment_status
  end

  test "a rolled back payment does not enqueue a kitchen push" do
    ActiveJob::Base.queue_adapter = ActiveJob::QueueAdapters::TestAdapter.new

    assert_no_enqueued_jobs only: KitchenPushJob do
      Order.transaction do
        @order.apply_successful_payment!
        raise ActiveRecord::Rollback
      end
    end

    assert_equal "pending_payment", @order.reload.status
  end
end
