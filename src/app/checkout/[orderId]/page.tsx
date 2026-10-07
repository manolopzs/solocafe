import { notFound } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'
import { createPaymentIntent } from '@/server/actions/payments'
import { CheckoutForm } from '@/components/order/checkout-form'

export const instant = false

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const order = await getOrderWithItems(orderId)
  if (!order) notFound()

  if (order.payment_status === 'succeeded') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Pedido pagado</h1>
        <p className="mt-2 text-zinc-600">Tu pedido ya fue pagado. Ve a la cafeteria a recogerlo.</p>
      </div>
    )
  }

  const clientSecret = await createPaymentIntent(orderId)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Pagar pedido</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Total: {order.currency} {(order.total_cents / 100).toFixed(2)}
        </p>
        <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
      </div>
    </main>
  )
}
