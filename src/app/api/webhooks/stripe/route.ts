import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { env } from '@/lib/env'

const relevantEvents = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'account.updated',
])

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const orderId = paymentIntent.metadata.order_id

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const paymentStatus = event.type === 'payment_intent.succeeded' ? 'succeeded' : 'failed'
    const orderStatus = event.type === 'payment_intent.succeeded' ? 'received' : 'cancelled'

    const { data: payment } = await supabase
      .from('payments')
      .select('id, order_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (payment) {
      await supabase
        .from('payments')
        .update({
          status: paymentStatus,
          stripe_charge_id: paymentIntent.latest_charge as string | undefined,
        })
        .eq('id', payment.id)

      await supabase
        .from('orders')
        .update({ payment_status: paymentStatus, status: orderStatus })
        .eq('id', payment.order_id)

      await supabase.from('events').insert({
        shop_id: paymentIntent.transfer_data?.destination ?? '',
        order_id: payment.order_id,
        type: event.type === 'payment_intent.succeeded' ? 'payment_succeeded' : 'payment_failed',
        payload: {
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
        },
      })
    }
  }

  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account
    await supabase
      .from('shops')
      .update({
        stripe_connect_status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
      })
      .eq('stripe_account_id', account.id)
  }

  return NextResponse.json({ received: true })
}
