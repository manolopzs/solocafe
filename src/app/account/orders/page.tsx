import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentCustomer, getCustomerOrders } from '@/server/queries/customers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
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

function formatCurrency(cents: number, currency: string) {
  return `${currency} ${(cents / 100).toFixed(2)}`
}

function orderDate(date: string) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AccountOrdersPage() {
  const customer = await getCurrentCustomer()

  if (!customer) {
    redirect('/account/login')
  }

  const orders = await getCustomerOrders()

  return (
    <main className="min-h-screen bg-background px-5 py-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/account" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Icon name="arrow-left" className="h-4 w-4" />
            Tu cuenta
          </Link>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tus pedidos</h1>
        <p className="text-muted-foreground">Historial de pedidos en cafeterías que usan Solo Cafe.</p>

        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <Card variant="outline">
              <CardContent className="py-10 text-center text-muted-foreground">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <Icon name="receipt" className="h-7 w-7" />
                </div>
                <p className="mt-4 font-medium text-foreground">Aún no tienes pedidos</p>
                <p className="mt-1 text-sm">Cuando hagas tu primera orden aparecerá aquí.</p>
                <Button asChild className="mt-5">
                  <Link href="/explore">Explorar cafeterías</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      </div>
    </main>
  )
}

function OrderCard({ order }: { order: Order }) {
  const shopSlug = order.shop_slug ?? 'demo'

  return (
    <Card variant="outline">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{orderDate(order.created_at)}</p>
            <p className="font-semibold text-foreground">Orden #{order.id.slice(-6).toUpperCase()}</p>
          </div>
          <Badge variant={statusVariant[order.status] ?? 'secondary'}>{statusLabels[order.status] ?? order.status}</Badge>
        </div>

        <ul className="mt-4 space-y-1.5">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="text-sm text-muted-foreground">
              {item.quantity}x {item.item_name_snapshot}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-semibold text-foreground">{formatCurrency(order.total_cents, order.currency)}</span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/${shopSlug}?reorder=${order.id}`}>Reordenar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
