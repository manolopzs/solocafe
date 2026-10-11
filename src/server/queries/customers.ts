'use server'

import { apiGet } from '@/lib/api/server'
import type { Customer, Order } from '@/types'

export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    const data = await apiGet<{ customer: Customer }>('/customers/me')
    return data.customer
  } catch {
    return null
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
