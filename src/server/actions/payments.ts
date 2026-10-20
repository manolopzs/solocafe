'use server'

import { apiPost } from '@/lib/api/server'
import type { PaymentAttempt } from '@/types'

function orderTokenHeaders(accessToken?: string) {
  return accessToken ? { 'X-Order-Token': accessToken } : undefined
}

export async function createPaymentIntent(orderId: string, accessToken?: string) {
  const data = await apiPost<{ client_secret: string }>(
    '/payments',
    {
      order_id: orderId,
      token: accessToken,
    },
    false,
    orderTokenHeaders(accessToken)
  )
  return data.client_secret
}

export async function syncSaveCard(orderId: string, accessToken: string, saveCard: boolean) {
  await apiPost(
    '/payments',
    {
      order_id: orderId,
      token: accessToken,
      save_card: saveCard,
    },
    true,
    orderTokenHeaders(accessToken)
  )
}

export async function payWithSavedCard(
  orderId: string,
  paymentMethodId: string,
  returnUrl: string,
  accessToken: string
): Promise<PaymentAttempt> {
  return apiPost<PaymentAttempt>(
    '/payments',
    {
      order_id: orderId,
      payment_method_id: paymentMethodId,
      return_url: returnUrl,
      token: accessToken,
    },
    true,
    orderTokenHeaders(accessToken)
  )
}

export async function syncPayment(orderId: string, accessToken?: string): Promise<PaymentAttempt> {
  return apiPost<PaymentAttempt>(
    '/payments/sync',
    {
      order_id: orderId,
      token: accessToken,
    },
    true,
    orderTokenHeaders(accessToken)
  )
}
