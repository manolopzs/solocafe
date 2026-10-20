'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost } from '@/lib/api/server'
import { env } from '@/lib/env'
import type { ShopOnboarding } from '@/types'

export async function connectStripeAccount(shopId: string) {
  const refreshUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/${shopId}/settings`
  const returnUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/${shopId}/settings?stripe=connected`

  const data = await apiPost<{ url: string | null }>(`/shops/${shopId}/stripe/connect`, {
    refresh_url: refreshUrl,
    return_url: returnUrl,
  })

  revalidatePath(`/dashboard/${shopId}/settings`)
  revalidatePath(`/dashboard/${shopId}`)
  if (data.url) redirect(data.url)
  redirect(`/dashboard/${shopId}/settings?stripe=connected`)
}

export async function syncStripeStatus(shopId: string) {
  const data = await apiPost<{ onboarding: ShopOnboarding }>(
    `/shops/${shopId}/stripe/status`,
    {}
  )
  revalidatePath(`/dashboard/${shopId}`)
  revalidatePath(`/dashboard/${shopId}/settings`)
  return data.onboarding
}
