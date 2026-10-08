'use server'

import { redirect } from 'next/navigation'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import { env } from '@/lib/env'

export async function connectStripeAccount(shopId: string) {
  const refreshUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/${shopId}/settings`
  const returnUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/${shopId}/settings?stripe=connected`

  const data = await apiPost<{ url: string }>(`/shops/${shopId}/stripe/connect`, {
    refresh_url: refreshUrl,
    return_url: returnUrl,
  })

  redirect(data.url)
}
