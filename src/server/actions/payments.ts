'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { env } from '@/lib/env'

export async function createPaymentIntent(orderId: string) {
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, shop:shop_id(*)')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    throw new Error('Order not found')
  }

  const shop = order.shop as { stripe_account_id: string | null; stripe_connect_status: string; currency: string }

  if (!shop.stripe_account_id || shop.stripe_connect_status !== 'active') {
    throw new Error('Shop Stripe account not connected or active')
  }

  const { data: existing } = await supabase
    .from('payments')
    .select('id, stripe_payment_intent_id')
    .eq('order_id', orderId)
    .single()

  const platformFeeCents = Math.round(order.total_cents * (parseFloat(env.PLATFORM_FEE_PERCENT) / 100))

  let paymentIntentId: string

  if (existing?.stripe_payment_intent_id) {
    const paymentIntent = await stripe.paymentIntents.update(
      existing.stripe_payment_intent_id,
      {
        amount: order.total_cents,
        currency: shop.currency.toLowerCase(),
        application_fee_amount: platformFeeCents,
      },
      { stripeAccount: shop.stripe_account_id }
    )
    paymentIntentId = paymentIntent.id
  } else {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: order.total_cents,
        currency: shop.currency.toLowerCase(),
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: shop.stripe_account_id,
        },
        on_behalf_of: shop.stripe_account_id,
        automatic_payment_methods: { enabled: true },
        metadata: { order_id: orderId },
      },
      { stripeAccount: shop.stripe_account_id }
    )
    paymentIntentId = paymentIntent.id

    await supabase.from('payments').upsert({
      order_id: orderId,
      stripe_payment_intent_id: paymentIntent.id,
      amount_cents: order.total_cents,
      platform_fee_cents: platformFeeCents,
      currency: shop.currency,
      status: 'pending',
    })
  }

  return paymentIntentId
}
