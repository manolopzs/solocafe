import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'
import { getCurrentCustomer } from '@/server/queries/customers'
import { getSavedCards } from '@/server/queries/payment-methods'
import { createPaymentIntent } from '@/server/actions/payments'
import { CheckoutForm } from '@/components/order/checkout-form'
import { formatMoney, formatPickupWindow } from '@/lib/ordering'
import type { CustomerPaymentMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Icon name="check" className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-foreground">Pedido pagado</h1>
          <p className="mt-2 text-muted-foreground">
            Tu pedido ya fue pagado. Ve a la cafetería a recogerlo.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href={`/order/${orderId}?token=${encodeURIComponent(token)}`}>Ver tu pedido</Link>
          </Button>
        </div>
      </main>
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
  const clientSecret = await createPaymentIntent(orderId, token)
  const eta =
    order.pickup_window_starts_at && order.pickup_window_ends_at
      ? formatPickupWindow(
          order.pickup_window_starts_at,
          order.pickup_window_ends_at,
          order.shop?.timezone || 'America/Mexico_City'
        )
      : 'Lo antes posible'

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-xl">
        <Link href={order.shop?.slug ? `/${order.shop.slug}` : '/'} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="arrow-left" className="h-4 w-4" />
          Volver al menú
        </Link>

        <div className="mb-6 flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs text-primary-foreground">1</span>
          <span className="text-foreground">Resumen</span>
          <span className="h-px flex-1 bg-border" />
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-border text-xs text-foreground">2</span>
          <span>Pago</span>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated">
            <Icon name="store" className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumen del pedido</p>
            <h1 className="text-xl font-semibold text-foreground">{order.customer_name || 'Tu pedido'}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Orden #{orderNumber(order.id)}</span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1">
                <Icon name="clock" className="h-3.5 w-3.5" />
                {eta}
              </span>
            </div>
          </div>
        </div>

        <Card variant="outline" className="mb-4 overflow-hidden">
          <div className="border-b border-border bg-surface px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tu orden</p>
          </div>
          <CardContent className="p-5">
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {item.quantity}x {item.item_name_snapshot}
                    </p>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.modifiers.map((m) => m.option_name_snapshot).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-medium text-foreground">
                    {formatMoney(item.subtotal_cents, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal_cents, order.currency)}</span>
              </div>
              {order.tax_cents > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Impuestos</span>
                  <span>{formatMoney(order.tax_cents, order.currency)}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{formatMoney(order.total_cents, order.currency)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Icon name="check" className="h-3 w-3" />
            Apple Pay, Google Pay y tarjeta
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Icon name="clock" className="h-3 w-3" />
            {eta}
          </Badge>
        </div>

        <Card variant="outline" className="overflow-hidden">
          <div className="border-b border-border bg-surface px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pago</p>
          </div>
          <CardContent className="p-5 sm:p-6">
            <CheckoutForm
              orderId={orderId}
              clientSecret={clientSecret}
              accessToken={token}
              savedCards={savedCards}
              canSaveCard={canSaveCard}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
