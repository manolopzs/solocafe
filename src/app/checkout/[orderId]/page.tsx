import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'
import { createPaymentIntent } from '@/server/actions/payments'
import { CheckoutForm } from '@/components/order/checkout-form'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Icon name="check" className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-foreground">Pedido pagado</h1>
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
        <div className="rounded-3xl bg-paper p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Pagar pedido</h1>
          <p className="mt-1 text-muted-foreground">
            Total: {order.currency} {(order.total_cents / 100).toFixed(2)}
          </p>
          <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
        </div>
      </div>
    </main>
  )
}
