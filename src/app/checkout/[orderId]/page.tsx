import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'
import { createPaymentIntent } from '@/server/actions/payments'
import { CheckoutForm } from '@/components/order/checkout-form'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent } from '@/components/ui/card'

export const instant = false

interface CheckoutPageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ phone?: string }>
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { orderId } = await params
  const { phone } = await searchParams
  const order = await getOrderWithItems(orderId, phone)
  if (!order) notFound()

  if (order.payment_status === 'succeeded') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md rounded-3xl bg-paper p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <Icon name="check" className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground">Pedido pagado</h1>
          <p className="mt-2 text-muted-foreground">
            Tu pedido ya fue pagado. Ve a la cafeteria a recogerlo.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </main>
    )
  }

  const clientSecret = await createPaymentIntent(orderId)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Pagar pedido</h1>
          <p className="mt-1 text-muted-foreground">Revisa tu orden y completa el pago.</p>
        </div>

        <Card variant="outline" className="mb-4 overflow-hidden">
          <div className="border-b border-warm-100 bg-cream px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumen</p>
          </div>
          <CardContent className="p-5">
            <ul className="space-y-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span className="text-foreground">
                    {item.quantity}x {item.item_name_snapshot}
                  </span>
                  <span className="font-medium text-foreground">
                    {order.currency} {(item.subtotal_cents / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-warm-100 pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{order.currency} {(order.subtotal_cents / 100).toFixed(2)}</span>
              </div>
              {order.tax_cents > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Impuestos</span>
                  <span>{order.currency} {(order.tax_cents / 100).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span className="text-terracotta-600">{order.currency} {(order.total_cents / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="outline" className="p-6 shadow-sm sm:p-8">
          <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
        </Card>
      </div>
    </main>
  )
}
