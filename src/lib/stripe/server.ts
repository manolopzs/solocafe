import Stripe from 'stripe'
import { env } from '@/lib/env'
import { isConfiguredStripeKey } from '@/lib/stripe/keys'

let stripeClient: Stripe | null = null

export function getServerStripe(): Stripe | null {
  if (!isConfiguredStripeKey(env.STRIPE_SECRET_KEY, 'secret')) return null
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-09-30.endive',
    })
  }
  return stripeClient
}
