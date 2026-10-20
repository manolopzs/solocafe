'use server'

import { apiPost } from '@/lib/api/server'

export async function createPaymentIntent(orderId: string, accessToken?: string) {
  const headers = accessToken ? { 'X-Order-Token': accessToken } : undefined
  const data = await apiPost<{ client_secret: string }>(
    '/payments',
    {
      order_id: orderId,
      token: accessToken,
    },
    false,
    headers
  )
  return data.client_secret
}
