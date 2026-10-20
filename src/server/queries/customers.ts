'use server'

import { apiGet } from '@/lib/api/server'
import type { Customer, LoyaltyProgress, Order } from '@/types'

export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    const data = await apiGet<{ customer: Customer }>('/customers/me')
    return data.customer
  } catch {
    return null
  }
}

export async function getLoyaltyCards(): Promise<LoyaltyProgress[]> {
  try {
    const data = await apiGet<{ cards: LoyaltyProgress[] }>('/customers/me/loyalty')
    return data.cards
  } catch {
    return []
  }
}

export async function getCustomerOrders(): Promise<Order[]> {
  try {
    const data = await apiGet<{ orders: Order[] }>('/customers/me/orders')
    return data.orders
  } catch {
    return []
  }
}

export async function getCustomerOrder(orderId: string): Promise<Order | null> {
  try {
    const data = await apiGet<{ order: Order }>(`/customers/me/orders/${orderId}`)
    return data.order
  } catch {
    return null
  }
}
