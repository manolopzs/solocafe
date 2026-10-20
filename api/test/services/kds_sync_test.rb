require "test_helper"

class KdsSyncTest < ActiveSupport::TestCase
  test "retry delays grow until the cap" do
    assert_equal [ 1000, 2000, 4000, 8000, 16000, 30000 ], KdsSync.retry_delays
    assert_equal 1000, KdsSync.delay_ms(0)
    assert_equal 4000, KdsSync.delay_ms(2)
    assert_equal 30000, KdsSync.delay_ms(5)
    assert_equal 30000, KdsSync.delay_ms(12)
    assert_equal 1000, KdsSync.delay_ms(-3)
  end

  test "snapshot carries the shared poll contract" do
    moment = Time.zone.parse("2026-10-20T12:00:00Z")
    snapshot = KdsSync.snapshot(moment)

    assert_equal 5000, snapshot[:poll_interval_ms]
    assert_equal [ 1000, 2000, 4000, 8000, 16000, 30000 ], snapshot[:retry_delays_ms]
    assert_equal moment, Time.zone.parse(snapshot[:server_time])
    assert_nil snapshot[:vapid_public_key]
  end
end
