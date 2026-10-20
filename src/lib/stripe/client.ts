import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { env } from '@/lib/env'
import { isConfiguredStripeKey } from '@/lib/stripe/keys'

let platformStripe: Promise<Stripe | null> | null = null

export function getStripe(stripeAccountId?: string | null) {
  const publishableKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!isConfiguredStripeKey(publishableKey, 'publishable')) return null

  if (!stripeAccountId) {
    if (!platformStripe) {
      platformStripe = loadStripe(publishableKey)
    }
    return platformStripe
  }

  return loadStripe(publishableKey, { stripeAccount: stripeAccountId })
}
