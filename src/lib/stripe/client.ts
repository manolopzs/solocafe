import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { env } from '@/lib/env'

let platformStripe: Promise<Stripe | null> | null = null

export function getStripe(stripeAccountId?: string | null) {
  if (!stripeAccountId) {
    if (!platformStripe) {
      platformStripe = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    }
    return platformStripe
  }

  return loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, { stripeAccount: stripeAccountId })
}
