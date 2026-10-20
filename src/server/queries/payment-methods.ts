'use server'

import { apiGet } from '@/lib/api/server'
import type { CustomerPaymentMethod } from '@/types'

export async function getSavedCards(): Promise<CustomerPaymentMethod[]> {
  const data = await apiGet<{ payment_methods: CustomerPaymentMethod[] }>('/customers/me/payment_methods')
  return data.payment_methods
}
