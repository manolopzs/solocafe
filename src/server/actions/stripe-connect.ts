'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function connectStripeAccount(shopId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('shop_members')
    .select('id')
    .eq('shop_id', shopId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) throw new Error('Unauthorized')

  const { data: shop } = await supabase.from('shops').select('*').eq('id', shopId).single()
  if (!shop) throw new Error('Shop not found')

  let accountId = shop.stripe_account_id

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: shop.currency === 'EUR' ? 'ES' : 'MX',
      business_type: 'individual',
      metadata: { shop_id: shopId },
    })
    accountId = account.id

    await supabase.from('shops').update({ stripe_account_id: accountId }).eq('id', shopId)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const refreshUrl = `${appUrl}/dashboard/${shopId}/settings`
  const returnUrl = `${appUrl}/dashboard/${shopId}/settings?stripe=connected`

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  redirect(accountLink.url)
}
