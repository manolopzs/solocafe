import { notFound, redirect } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'
import { getCurrentCustomer } from '@/server/queries/customers'
import { getSavedCards } from '@/server/queries/payment-methods'
import { completeFreeOrder, createPaymentIntent } from '@/server/actions/payments'
import { checkoutPaymentMessage, isConfiguredStripeKey, STRIPE_NOT_CONFIGURED_MESSAGE } from '@/lib/stripe/keys'
import { env } from '@/lib/env'
import { CheckoutForm } from '@/components/order/checkout-form'
import { CheckoutScreen } from '@/components/order/checkout-screen'
import { CUSTOMER_TIME_ZONE, formatMoney, formatPickupWindow } from '@/lib/ordering'
import type { CustomerPaymentMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'

export const instant = false

function orderNumber(id: string) {
  return id.slice(-6).toUpperCase()
}

interface CheckoutPageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { orderId } = await params
  const { token } = await searchParams
  const order = await getOrderWithItems(orderId, token)
  if (!order || !token) notFound()

  if (order.payment_status === 'succeeded') {
    return (
      <CheckoutScreen
        backHref={order.shop?.slug ? `/${order.shop.slug}` : '/'}
        title={order.shop?.name || 'Tu pedido'}
        orderCode={`#${orderNumber(order.id)}`}
        eta=""
        lines={[]}
        subtotal=""
        total=""
        paidHref={`/order/${orderId}?token=${encodeURIComponent(token)}`}
      />
    )
  }

  const viewer = await getCurrentCustomer()
  const canSaveCard = Boolean(viewer && order.customer_id && viewer.id === order.customer_id)
  let savedCards: CustomerPaymentMethod[] = []
  if (canSaveCard) {
    try {
      savedCards = await getSavedCards()
    } catch {
      savedCards = []
    }
  }
  const complimentary = order.total_cents === 0
  let clientSecret: string | null = null
  let paymentSetupError: string | null = null
  let paymentAlreadyCaptured = false
  if (!complimentary) {
    if (!isConfiguredStripeKey(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, 'publishable')) {
      paymentSetupError = STRIPE_NOT_CONFIGURED_MESSAGE
    } else {
      try {
        const payment = await createPaymentIntent(orderId, token)
        if (payment.status === 'succeeded') {
          paymentAlreadyCaptured = true
        } else {
          clientSecret = payment.client_secret
        }
      } catch (error) {
        paymentSetupError = checkoutPaymentMessage(error)
      }
    }
  }

  if (paymentAlreadyCaptured) {
    redirect(`/order/${orderId}?token=${encodeURIComponent(token)}`)
  }
  const eta =
    order.pickup_window_starts_at && order.pickup_window_ends_at
      ? formatPickupWindow(
          order.pickup_window_starts_at,
          order.pickup_window_ends_at,
          order.shop?.timezone || CUSTOMER_TIME_ZONE
        )
      : 'Lo antes posible'

  return (
    <CheckoutScreen
      backHref={order.shop?.slug ? `/${order.shop.slug}` : '/'}
      title={order.shop?.name || order.customer_name || 'Tu pedido'}
      orderCode={`#${orderNumber(order.id)}`}
      eta={eta}
      lines={order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        name: item.item_name_snapshot,
        detail: item.modifiers?.map((modifier) => modifier.option_name_snapshot).join(', ') || undefined,
        amount: formatMoney(item.subtotal_cents, order.currency),
      }))}
      subtotal={formatMoney(order.subtotal_cents, order.currency)}
      discount={(order.discount_cents ?? 0) > 0 ? formatMoney(order.discount_cents ?? 0, order.currency) : null}
      tax={order.tax_cents > 0 ? formatMoney(order.tax_cents, order.currency) : null}
      total={formatMoney(order.total_cents, order.currency)}
    >
      {complimentary ? (
        <form action={completeFreeOrder.bind(null, orderId, token)} className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Este pedido queda cubierto por tu recompensa. No hace falta pagar.
          </p>
          <Button type="submit" size="lg" className="w-full">
            Confirmar pedido
          </Button>
        </form>
      ) : paymentSetupError || !clientSecret ? (
        <Notice tone="danger">{paymentSetupError ?? 'No pudimos preparar el pago. Inténtalo de nuevo.'}</Notice>
      ) : (
        <CheckoutForm
          orderId={orderId}
          clientSecret={clientSecret}
          accessToken={token}
          savedCards={savedCards}
          canSaveCard={canSaveCard}
        />
      )}
    </CheckoutScreen>
  )
}
