'use server'

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'

export async function getShopAnalytics(shopId: string) {
  try {
    const data = await apiGet<{
      order_count: number
      revenue_cents: number
      average_ticket_cents: number
    }>(`/shops/${shopId}/analytics/summary`)

    return {
      orderCount: data.order_count,
      revenueCents: data.revenue_cents,
      averageTicketCents: data.average_ticket_cents,
    }
  } catch {
    return {
      orderCount: 0,
      revenueCents: 0,
      averageTicketCents: 0,
    }
  }
}
