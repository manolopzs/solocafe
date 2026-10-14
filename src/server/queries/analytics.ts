'use server'

import { apiGet } from '@/lib/api/server'
import type { ShopAnalytics } from '@/types'

export async function getShopAnalytics(shopId: string, days: number | 'all' = 30): Promise<ShopAnalytics> {
  try {
    const daysParam = days === 'all' ? 'all' : String(days)
    const data = await apiGet<ShopAnalytics>(`/shops/${shopId}/analytics/summary?days=${daysParam}`)

    return {
      order_count: data.order_count ?? 0,
      revenue_cents: data.revenue_cents ?? 0,
      average_ticket_cents: data.average_ticket_cents ?? 0,
      peak_hours: data.peak_hours ?? [],
      top_items: data.top_items ?? [],
      repeat_customer_rate: data.repeat_customer_rate ?? 0,
    }
  } catch {
    return {
      order_count: 0,
      revenue_cents: 0,
      average_ticket_cents: 0,
      peak_hours: [],
      top_items: [],
      repeat_customer_rate: 0,
    }
  }
}
