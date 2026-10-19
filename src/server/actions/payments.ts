'use server'

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'

export async function createPaymentIntent(orderId: string, customerPhone?: string) {
  const data = await apiPost<{ client_secret: string }>('/payments', {
    order_id: orderId,
    customer_phone: customerPhone,
  })
  return data.client_secret
}
