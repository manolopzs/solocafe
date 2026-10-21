require "test_helper"
require "net/http"

class KitchenPushTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  setup do
    @owner = User.create!(email: "kitchen-push@example.com", password: "password123")
    @shop = Shop.create!(name: "Cafe Norte", slug: "cafe-norte", currency: "MXN", owner: @owner)
    @other_shop = Shop.create!(name: "Cafe Sur", slug: "cafe-sur", currency: "MXN", owner: @owner)
    @order = Order.create!(
      shop: @shop,
      status: "pending_payment",
      payment_status: "pending",
      subtotal_cents: 1800,
      total_cents: 1800,
      currency: "MXN",
      pickup_type: "asap"
    )
    @web = register_web(@shop, "https://push.example/alpha", "alpha-p256dh", "alpha-auth")
  end

  teardown do
    Current.shop = nil
  end

  test "arrival enqueues a push only for the order shop" do
    register_web(@other_shop, "https://push.example/other", "other-p256dh", "other-auth")
    Current.shop = @other_shop

    with_immediate_enqueue do
      assert_enqueued_jobs 1, only: KitchenPushJob do
        @order.record_kitchen_arrival!
      end
    end

    assert_enqueued_with(
      job: KitchenPushJob,
      args: [ @shop.id, @web.id, KitchenPush.message_for(@order) ]
    )
    assert_equal @other_shop.id, Current.shop.id
  end

  test "a paid order enqueues one kitchen push" do
    with_immediate_enqueue do
      @order.apply_successful_payment!
      assert_enqueued_jobs 1, only: KitchenPushJob
      @order.apply_successful_payment!
      assert_enqueued_jobs 1, only: KitchenPushJob
    end

    assert_equal "received", @order.status
    assert_equal "succeeded", @order.payment_status
  end

  test "arrival enqueues when no shop is current" do
    Current.shop = nil

    with_immediate_enqueue do
      @order.record_kitchen_arrival!
    end

    assert_enqueued_with(
      job: KitchenPushJob,
      args: [ @shop.id, @web.id, KitchenPush.message_for(@order) ]
    )
    assert_nil Current.shop
  end

  test "a repeated arrival does not enqueue another push" do
    with_immediate_enqueue do
      @order.record_kitchen_arrival!
      assert_no_enqueued_jobs only: KitchenPushJob do
        @order.record_kitchen_arrival!
      end
    end
  end

  test "delivery sends a Spanish alert as client agnostic JSON" do
    delivered = deliver_order

    assert_equal 1, delivered.length
    call = delivered.first
    assert_equal @web.endpoint, call[:endpoint]
    assert_equal "alpha-p256dh", call[:p256dh]
    assert_equal "alpha-auth", call[:auth]
    assert_equal "high", call[:urgency]
    assert_equal "mailto:cocina@example.com", call.dig(:vapid, :subject)
    assert_equal "test-public", call.dig(:vapid, :public_key)
    assert_equal "test-private", call.dig(:vapid, :private_key)

    payload = JSON.parse(call[:message])
    assert_equal "Nuevo pedido", payload["title"]
    assert_equal "Hay un pedido nuevo en cocina.", payload["body"]
    assert_equal "order.kitchen_new", payload["event"]
    assert_equal @shop.id, payload["shop_id"]
    assert_equal @order.id, payload["order_id"]
    assert_equal %w[body event order_id shop_id title], payload.keys.sort
    assert device_exists?(@web.id)
  end

  test "an English shop gets English copy" do
    @shop.update!(locale: "en")

    payload = JSON.parse(deliver_order.first[:message])

    assert_equal "New order", payload["title"]
    assert_equal "A new order is in the kitchen.", payload["body"]
  end

  test "an expired subscription is pruned" do
    deliver_raising(WebPush::ExpiredSubscription, Net::HTTPGone, "410", "Gone")

    assert_not device_exists?(@web.id)
  end

  test "an invalid subscription is pruned" do
    deliver_raising(WebPush::InvalidSubscription, Net::HTTPNotFound, "404", "Not Found")

    assert_not device_exists?(@web.id)
  end

  test "a push service error keeps the subscription and retries five times" do
    error = push_response_error(WebPush::PushServiceError, Net::HTTPInternalServerError, "500", "Error")
    message = KitchenPush.message_for(@order)
    attempts = count_failed_pushes(error) do
      with_immediate_enqueue do
        job = KitchenPushJob.new(@shop.id, @web.id, message)
        4.times do
          job.perform_now
          scheduled = enqueued_jobs.last
          assert_equal KitchenPushJob, scheduled[:job]
          assert scheduled[:at] >= Time.current.to_f + 2
          job = ActiveJob::Base.deserialize(scheduled)
          clear_enqueued_jobs
        end

        assert_raises(WebPush::PushServiceError) do
          job.perform_now
        end
      end
    end

    assert_equal 5, attempts
    assert_empty enqueued_jobs
    assert device_exists?(@web.id)
  end

  test "a rejected VAPID response keeps the subscription and is not retried" do
    error = push_response_error(WebPush::Unauthorized, Net::HTTPUnauthorized, "401", "Unauthorized")
    attempts = count_failed_pushes(error) do
      with_immediate_enqueue do
        assert_no_enqueued_jobs only: KitchenPushJob do
          assert_raises(WebPush::Unauthorized) do
            KitchenPushJob.perform_now(@shop.id, @web.id, KitchenPush.message_for(@order))
          end
        end
      end
    end

    assert_equal 1, attempts
    assert device_exists?(@web.id)
  end

  test "missing VAPID configuration does not send" do
    called = false
    without_vapid do
      capture_web_push do |calls|
        KitchenPushJob.perform_now(@shop.id, @web.id, KitchenPush.message_for(@order))
        called = calls.any?
      end
    end

    assert_not called
    assert device_exists?(@web.id)
  end

  test "a device from another shop is not delivered" do
    called = false
    with_vapid do
      capture_web_push do |calls|
        KitchenPushJob.perform_now(@other_shop.id, @web.id, KitchenPush.message_for(@order))
        called = calls.any?
      end
    end

    assert_not called
    assert device_exists?(@web.id)
    assert_nil Current.shop
  end

  test "a missing shop is not delivered" do
    called = false
    with_vapid do
      capture_web_push do |calls|
        KitchenPushJob.perform_now(SecureRandom.uuid, @web.id, KitchenPush.message_for(@order))
        called = calls.any?
      end
    end

    assert_not called
    assert device_exists?(@web.id)
  end

  test "expo registrations stay stored for a later native sender" do
    expo = register_expo(@shop, "ExponentPushToken[alpha]")
    endpoints = []

    with_vapid do
      capture_web_push do |calls|
        with_immediate_enqueue do
          @order.record_kitchen_arrival!
          perform_enqueued_jobs
        end
        endpoints = calls.map { |call| call[:endpoint] }
      end
    end

    assert_equal [ @web.endpoint ], endpoints
    assert device_exists?(expo.id)
    assert device_exists?(@web.id)
  end

  test "delivery waits until the surrounding transaction commits" do
    assert KitchenPushJob.enqueue_after_transaction_commit
  end

  private

  def deliver_order
    delivered = []
    with_vapid do
      capture_web_push do |calls|
        KitchenPushJob.perform_now(@shop.id, @web.id, KitchenPush.message_for(@order))
        delivered = calls
      end
    end
    delivered
  end

  def deliver_raising(error_class, response_class, code, reason)
    deliver_raising_error(push_response_error(error_class, response_class, code, reason))
  end

  def deliver_raising_error(error)
    with_vapid do
      capture_web_push(error: error) do
        KitchenPushJob.perform_now(@shop.id, @web.id, KitchenPush.message_for(@order))
      end
    end
  end

  def count_failed_pushes(error)
    attempts = 0
    with_vapid do
      capture_web_push(error: error) do
        WebPush.define_singleton_method(:payload_send) do |**kwargs|
          attempts += 1
          raise error
        end
        yield
      end
    end
    attempts
  end

  def capture_web_push(error: nil)
    calls = []
    original = WebPush.method(:payload_send)
    WebPush.define_singleton_method(:payload_send) do |**kwargs|
      raise error if error
      calls << kwargs
    end
    yield calls
  ensure
    WebPush.define_singleton_method(:payload_send) do |**kwargs|
      original.call(**kwargs)
    end
  end

  def push_response_error(error_class, response_class, code, reason)
    response = response_class.new("1.1", code, reason)
    response.body = ""
    response.instance_variable_set(:@read, true)
    error_class.new(response, "push.example")
  end

  def register_web(shop, endpoint, p256dh, auth_key)
    Current.set(shop: shop) do
      PushDevice.register!(
        shop: shop,
        user: @owner,
        attributes: {
          platform: "web",
          endpoint: endpoint,
          p256dh: p256dh,
          auth_key: auth_key
        }
      )
    end
  end

  def register_expo(shop, token)
    Current.set(shop: shop) do
      PushDevice.register!(
        shop: shop,
        user: @owner,
        attributes: { platform: "expo", token: token }
      )
    end
  end

  def device_exists?(id)
    TenantScoped.unscoped_for_system { PushDevice.exists?(id) }
  end

  def with_immediate_enqueue
    previous = KitchenPushJob.enqueue_after_transaction_commit
    KitchenPushJob.enqueue_after_transaction_commit = false
    yield
  ensure
    KitchenPushJob.enqueue_after_transaction_commit = previous
  end

  def with_vapid
    previous = vapid_env
    ENV["VAPID_PUBLIC_KEY"] = "test-public"
    ENV["VAPID_PRIVATE_KEY"] = "test-private"
    ENV["VAPID_SUBJECT"] = "mailto:cocina@example.com"
    yield
  ensure
    restore_env(previous)
  end

  def without_vapid
    previous = vapid_env
    %w[VAPID_PUBLIC_KEY VAPID_PRIVATE_KEY VAPID_SUBJECT].each { |key| ENV.delete(key) }
    yield
  ensure
    restore_env(previous)
  end

  def vapid_env
    %w[VAPID_PUBLIC_KEY VAPID_PRIVATE_KEY VAPID_SUBJECT].index_with { |key| ENV[key] }
  end

  def restore_env(previous)
    previous.each do |key, value|
      value.nil? ? ENV.delete(key) : ENV[key] = value
    end
  end
end
