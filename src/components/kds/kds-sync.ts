export type KdsSyncPolicy = {
  server_time: string
  poll_interval_ms: number
  retry_delays_ms: number[]
  vapid_public_key: string | null
}

export type KdsAlert = {
  order_id: string
  event_type: string
  created_at: string
}

export class KdsSync {
  static readonly fallbackDelaysMs = [1000, 2000, 4000, 8000, 16000, 30000]
  static readonly fallbackPollMs = 5000

  static delayMs(attempt: number, delays: number[] = KdsSync.fallbackDelaysMs): number {
    const schedule = delays.length > 0 ? delays : KdsSync.fallbackDelaysMs
    const index = Math.max(0, Math.floor(attempt))
    return schedule[Math.min(index, schedule.length - 1)]
  }
}
