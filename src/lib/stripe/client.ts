import { loadStripe } from '@stripe/stripe-js'
import { env } from '@/lib/env'

export const getStripe = () => loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
