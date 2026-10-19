'use server'

import { apiGet } from '@/lib/api/server'
import type { Order } from '@/types'

export async function getRecentOrders(shopId: string): Promise<Order[]> {
  try {
    const data = await apiGet<{ orders: Order[] }>(`/shops/${shopId}/orders/recent`)
    return data.orders ?? []
  } catch {
    return []
  }
}
