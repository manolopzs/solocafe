'use server'

import { apiGet } from '@/lib/api/server'
import type { Order, OrderItem, OrderItemModifier, UsualOrder } from '@/types'

function tokenQuery(accessToken?: string) {
  return accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''
}

function tokenHeaders(accessToken?: string): HeadersInit | undefined {
  return accessToken ? { 'X-Order-Token': accessToken } : undefined
}

export async function getOrderById(id: string, accessToken?: string): Promise<Order | null> {
  try {
    const data = await apiGet<{ order: Order }>(
      `/public/orders/${id}${tokenQuery(accessToken)}`,
      false,
      tokenHeaders(accessToken)
    )
    return data.order
  } catch {
    return null
  }
}

export async function getOrderWithItems(
  id: string,
  accessToken?: string
): Promise<(Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }) | null> {
  try {
    const data = await apiGet<{
      order: Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }
    }>(`/public/orders/${id}${tokenQuery(accessToken)}`, false, tokenHeaders(accessToken))
    return data.order
  } catch {
    return null
  }
}

export async function getUsualOrder(shopId: string): Promise<UsualOrder | null> {
  try {
    const data = await apiGet<{ usual_order: UsualOrder | null }>(`/shops/${shopId}/orders/usual`)
    return data.usual_order
  } catch {
    return null
  }
}

export async function getShopOrders(shopId: string, status?: string): Promise<Order[]> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    const data = await apiGet<{ orders: Order[] }>(`/shops/${shopId}/orders${query}`)
    return data.orders
  } catch {
    return []
  }
}
