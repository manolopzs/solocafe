'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiPost } from '@/lib/api/server'
import { env } from '@/lib/env'
import type { ShopOnboarding } from '@/types'

export async function connectStripeAccount(shopId: string) {
  const refreshUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/${shopId}/settings`
  const returnUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/${shopId}/settings?stripe=connected`

  try {
    const data = await apiPost<{ url: string | null }>(`/shops/${shopId}/stripe/connect`, {
      refresh_url: refreshUrl,
      return_url: returnUrl,
    })

    revalidatePath(`/dashboard/${shopId}/settings`)
    revalidatePath(`/dashboard/${shopId}`)
    if (data.url) redirect(data.url)
    redirect(`/dashboard/${shopId}/settings?stripe=connected`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    // Next.js redirect() throws a special error; rethrow those.
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      String((error as { digest?: unknown }).digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error
    }
    const code = message.includes('stripe_not_configured')
      ? 'not_configured'
      : 'error'
    redirect(`/dashboard/${shopId}/settings?stripe=${code}`)
  }
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
