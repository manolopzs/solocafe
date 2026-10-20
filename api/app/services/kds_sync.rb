class KdsSync
  POLL_INTERVAL_MS = 5_000
  RETRY_BASE_MS = 1_000
  RETRY_MAX_MS = 30_000
  RETRY_FACTOR = 2

  def self.policy
    {
      poll_interval_ms: POLL_INTERVAL_MS,
      retry_delays_ms: retry_delays,
      vapid_public_key: ENV["VAPID_PUBLIC_KEY"].presence
    }
  end

  def self.snapshot(server_time = Time.current)
    policy.merge(server_time: server_time.iso8601(6))
  end

  def self.retry_delays
    delays = []
    delay = RETRY_BASE_MS
    16.times do
      capped = [ delay, RETRY_MAX_MS ].min
      delays << capped
      break if capped == RETRY_MAX_MS

      delay *= RETRY_FACTOR
    end
    delays
  end

  def self.delay_ms(attempt)
    delays = retry_delays
    index = Integer(attempt)
    index = 0 if index.negative?
    delays.fetch(index, delays.last)
  end
end
