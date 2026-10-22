import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { CUSTOMER_TIME_ZONE, formatMoney } from '@/lib/ordering'
import type { Order } from '@/types'

const statusLabels: Record<string, string> = {
  pending_payment: 'Pendiente de pago',
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo',
  picked_up: 'Entregado',
  cancelled: 'Cancelado',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'danger' | 'warning'> = {
  pending_payment: 'secondary',
  received: 'secondary',
  preparing: 'warning',
  ready: 'success',
  picked_up: 'default',
  cancelled: 'danger',
}

function orderDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: CUSTOMER_TIME_ZONE,
  })
}

export function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-5">
        <Link href="/account" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="arrow-left" className="h-4 w-4" />
          Tu cuenta
        </Link>

        <h1 className="mt-8 text-[2rem] font-medium leading-tight tracking-tight text-foreground">Tus pedidos</h1>
        <p className="mt-2 text-base text-muted-foreground">Historial de pedidos en cafeterías que usan Solo Cafe.</p>

        <div className="mt-8 space-y-3">
          {orders.length === 0 ? (
            <EmptyState
              icon={<Icon name="receipt" className="h-6 w-6" />}
              title="Aún no tienes pedidos"
              description="Cuando hagas tu primera orden aparecerá aquí."
              action={
                <Button asChild>
                  <Link href="/explore">Explorar cafeterías</Link>
                </Button>
              }
            />
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </div>
    </main>
  )
}

function OrderCard({ order }: { order: Order }) {
  const shopSlug = order.shop_slug ?? 'demo'

  return (
    <Card variant="flat">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{orderDate(order.created_at)}</p>
            <p className="mt-0.5 font-medium text-foreground">Pedido #{order.id.slice(-6).toUpperCase()}</p>
          </div>
          <Badge variant={statusVariant[order.status] ?? 'secondary'}>{statusLabels[order.status] ?? order.status}</Badge>
        </div>

        <ul className="mt-3 space-y-1">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="text-sm text-muted-foreground">
              {item.quantity} × {item.item_name_snapshot}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="font-medium tabular-nums text-foreground">{formatMoney(order.total_cents, order.currency)}</span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/${shopSlug}?reorder=${order.id}`}>Reordenar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
