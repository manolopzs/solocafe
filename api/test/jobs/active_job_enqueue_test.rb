require "test_helper"

class ActiveJobEnqueueTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  test "the test environment enqueues jobs on the test adapter" do
    assert_equal :test, Rails.application.config.active_job.queue_adapter
    assert_instance_of ActiveJob::QueueAdapters::TestAdapter, ActiveJob::Base.queue_adapter

    previous = KitchenPushJob.enqueue_after_transaction_commit
    KitchenPushJob.enqueue_after_transaction_commit = false
    assert_enqueued_with(job: KitchenPushJob, args: [ "shop", "device", { "ok" => true } ]) do
      KitchenPushJob.perform_later("shop", "device", { "ok" => true })
    end
  ensure
    KitchenPushJob.enqueue_after_transaction_commit = previous
  end
end
