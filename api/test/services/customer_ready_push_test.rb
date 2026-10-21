require "test_helper"

class CustomerReadyPushTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper
  setup do
    @owner = User.create!(email: "ready-push@example.com", password: "password123")
    @shop = Shop.create!(name: "Café Norte", slug: "ready-norte", currency: "EUR", locale: "es", owner: @owner)
    @other = Shop.create!(name: "Café Sur", slug: "ready-sur", currency: "EUR", locale: "es", owner: @owner)
    @order = Order.create!(
      shop: @shop,
      status: "preparing",
      payment_status: "succeeded",
      subtotal_cents: 280,
      total_cents: 280,
      currency: "EUR",
      pickup_type: "asap"
    )
    @customer_device = register(@shop, @order, "https://push.example/customer")
    @kitchen_device = register_kitchen(@shop, "https://push.example/kitchen")
    @foreign_device = register(@other, Order.create!(
      shop: @other,
      status: "preparing",
      payment_status: "succeeded",
      subtotal_cents: 280,
      total_cents: 280,
      currency: "EUR",
      pickup_type: "asap"
    ), "https://push.example/foreign")
  end

  teardown do
    Current.shop = nil
  end

  test "the ready job waits for the surrounding transaction" do
    assert CustomerReadyPushJob.enqueue_after_transaction_commit
  end

  test "becoming ready enqueues only that order's customer device" do
    calls = []
    with_vapid do
      capture_web_push do |sent|
        previous = CustomerReadyPushJob.enqueue_after_transaction_commit
        CustomerReadyPushJob.enqueue_after_transaction_commit = false
        begin
          @order.update!(status: "ready")
          CustomerReadyPush.enqueue(@order)
          perform_enqueued_jobs
          calls = sent
        ensure
          CustomerReadyPushJob.enqueue_after_transaction_commit = previous
        end
      end
    end

    assert_equal [ @customer_device.endpoint ], calls.map { |call| call[:endpoint] }
    assert_equal "Tu pedido está listo", JSON.parse(calls.first[:message])["title"]
  end

  test "the push message is the ready copy for the shop locale" do
    message = CustomerReadyPush.message_for(@order)
    assert_equal "Tu pedido está listo", message["title"]
    assert_equal "Pasa a recogerlo.", message["body"]
    assert_equal "order.ready", message["event"]
    assert_equal @order.id, message["order_id"]
  end

  test "a device from another shop is not delivered" do
    called = false
    with_vapid do
      capture_web_push do |calls|
        CustomerReadyPushJob.perform_now(@shop.id, @foreign_device.id, CustomerReadyPush.message_for(@order))
        called = calls.any?
      end
    end

    assert_not called
    assert TenantScoped.unscoped_for_system { PushDevice.exists?(@foreign_device.id) }
  end

  test "kitchen devices are not used for the customer ready push" do
    endpoints = []
    with_vapid do
      capture_web_push do |calls|
        CustomerReadyPushJob.perform_now(@shop.id, @kitchen_device.id, CustomerReadyPush.message_for(@order))
        endpoints = calls.map { |call| call[:endpoint] }
      end
    end

    assert_empty endpoints
  end

  private

  def register(shop, order, endpoint)
    Current.set(shop: shop) do
      PushDevice.register!(
        shop: shop,
        user: nil,
        attributes: {
          platform: "web",
          audience: "customer",
          order_id: order.id,
          endpoint: endpoint,
          p256dh: "p256dh-key",
          auth_key: "auth-key"
        }
      )
    end
  end

  def register_kitchen(shop, endpoint)
    Current.set(shop: shop) do
      PushDevice.register!(
        shop: shop,
        user: @owner,
        attributes: {
          platform: "web",
          endpoint: endpoint,
          p256dh: "kitchen-p256dh",
          auth_key: "kitchen-auth"
        }
      )
    end
  end

  def capture_web_push
    calls = []
    original = WebPush.method(:payload_send)
    WebPush.define_singleton_method(:payload_send) do |**kwargs|
      calls << kwargs
    end
    yield calls
  ensure
    WebPush.define_singleton_method(:payload_send) do |**kwargs|
      original.call(**kwargs)
    end
  end

  def with_vapid
    previous = %w[VAPID_PUBLIC_KEY VAPID_PRIVATE_KEY VAPID_SUBJECT].index_with { |key| ENV[key] }
    ENV["VAPID_PUBLIC_KEY"] = "test-public"
    ENV["VAPID_PRIVATE_KEY"] = "test-private"
    ENV["VAPID_SUBJECT"] = "mailto:cafe@example.com"
    yield
  ensure
    previous.each { |key, value| value.nil? ? ENV.delete(key) : ENV[key] = value }
  end
end
