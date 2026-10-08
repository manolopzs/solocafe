import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderWithItems } from '@/server/queries/orders'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent } from '@/components/ui/card'

export const instant = false

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const order = await getOrderWithItems(orderId)
  if (!order) notFound()

  const statusLabels: Record<string, string> = {
    received: 'Recibido',
    preparing: 'Preparando',
    ready: 'Listo',
    picked_up: 'Entregado',
    cancelled: 'Cancelado',
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <Icon name="check" className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground">Pago confirmado</h1>
          <p className="mt-2 text-muted-foreground">
            Tu pedido fue recibido. Te avisaremos cuando este listo.
          </p>
        </div>

        <Card variant="outline" className="mt-8 overflow-hidden">
          <div className="border-b border-warm-100 bg-cream px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detalle del pedido</p>
          </div>
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Numero</span>
              <span className="font-medium text-foreground">{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium text-foreground">{order.currency} {(order.total_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium text-foreground">{statusLabels[order.status] ?? order.status}</span>
            </div>
            {order.pickup_time && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recogida</span>
                <span className="font-medium text-foreground">{order.pickup_time}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Button asChild size="lg" className="mt-6 w-full">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  )
}
