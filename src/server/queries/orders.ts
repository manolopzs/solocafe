'use server'

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import type { Order, OrderItem, OrderItemModifier } from '@/types'

export async function getOrderById(id: string, customerPhone?: string): Promise<Order | null> {
  try {
    const query = customerPhone ? `?customer_phone=${encodeURIComponent(customerPhone)}` : ''
    const data = await apiGet<{ order: Order }>(`/public/orders/${id}${query}`, false)
    return data.order
  } catch {
    return null
  }
}

export async function getOrderWithItems(
  id: string,
  customerPhone?: string
): Promise<(Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }) | null> {
  try {
    const query = customerPhone ? `?customer_phone=${encodeURIComponent(customerPhone)}` : ''
    const data = await apiGet<{
      order: Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }
    }>(`/public/orders/${id}${query}`, false)
    return data.order
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
