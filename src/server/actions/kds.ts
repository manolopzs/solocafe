'use server'

import { revalidatePath } from 'next/cache'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import type { OrderStatus } from '@/types'

export const stateMachine: Record<OrderStatus, OrderStatus[]> = {
  received: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked_up'],
  picked_up: [],
  cancelled: [],
}

export async function updateOrderStatus(shopId: string, orderId: string, nextStatus: OrderStatus) {
  await apiPatch(`/shops/${shopId}/orders/${orderId}`, {
    order: { status: nextStatus },
  })
  revalidatePath(`/dashboard/${shopId}/kds`)
}
