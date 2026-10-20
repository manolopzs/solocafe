import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'
import { PaymentReturnSync } from '@/components/order/payment-return-sync'
import { formatMoney } from '@/lib/ordering'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export const instant = false

const statusLabels: Record<string, string> = {
  pending_payment: 'Pendiente de pago',
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo',
  picked_up: 'Entregado',
  cancelled: 'Cancelado',
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ token?: string; sync?: string }>
}) {
  const { orderId } = await params
  const { token, sync } = await searchParams
  const order = await getOrderWithItems(orderId, token)
  if (!order || !token) notFound()

  return (
    <main className="min-h-screen bg-background px-5 py-10">
      {sync === '1' && <PaymentReturnSync orderId={orderId} accessToken={token} />}
      <div className="mx-auto w-full max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <Icon name="check" className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-[2rem] font-medium leading-tight tracking-tight text-foreground">Pago confirmado</h1>
        <p className="mt-2 text-base leading-6 text-muted-foreground">
          Tu pedido fue recibido. Te avisaremos cuando esté listo.
        </p>

        <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Código de recogida</p>
        <p className="mt-1 text-4xl font-medium tracking-[0.18em] text-foreground">{order.id.slice(-6).toUpperCase()}</p>

        <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">Estado</dt>
            <dd className="font-medium text-foreground">{statusLabels[order.status] ?? order.status}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-medium tabular-nums text-foreground">{formatMoney(order.total_cents, order.currency)}</dd>
          </div>
          {order.pickup_time && (
            <div className="flex justify-between py-3">
              <dt className="text-muted-foreground">Recogida</dt>
              <dd className="font-medium text-foreground">{order.pickup_time}</dd>
            </div>
          )}
        </dl>

        <Button asChild size="lg" className="mt-8 w-full">
          <Link href={`/order/${orderId}?token=${encodeURIComponent(token)}`}>Seguir tu pedido</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="mt-3 w-full">
          <Link href={order.shop?.slug ? `/${order.shop.slug}` : '/'}>Volver al menú</Link>
        </Button>
      </div>
    </main>
  )
}
