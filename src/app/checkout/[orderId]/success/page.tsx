import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'

export const instant = false

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const order = await getOrderWithItems(orderId)
  if (!order) notFound()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Pago confirmado</h1>
        <p className="mt-2 text-zinc-600">
          Tu pedido fue recibido. Te avisaremos cuando este listo.
        </p>
        <div className="mt-6 rounded-lg bg-zinc-50 p-4 text-left text-sm">
          <p><span className="font-medium">Numero:</span> {order.id.slice(0, 8)}</p>
          <p><span className="font-medium">Total:</span> {order.currency} {(order.total_cents / 100).toFixed(2)}</p>
          <p><span className="font-medium">Estado:</span> {order.status}</p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
