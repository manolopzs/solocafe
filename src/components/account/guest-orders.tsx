'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import {
  EMPTY_GUEST_ORDERS,
  getGuestOrdersSnapshot,
  guestOrderHref,
  isActiveGuestOrder,
  subscribeGuestOrders,
  updateGuestOrderStatuses,
  type GuestOrder,
} from '@/lib/guest-orders'
import { CUSTOMER_TIME_ZONE, formatMoney } from '@/lib/ordering'
import { refreshGuestOrderStatuses } from '@/server/actions/guest-orders'

const statusLabels: Record<string, string> = {
  pending_payment: 'Pendiente de pago',
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo para recoger',
  picked_up: 'Entregado',
  cancelled: 'Cancelado',
}

const statusVariant: Record<string, 'secondary' | 'success' | 'danger' | 'warning' | 'default'> = {
  pending_payment: 'secondary',
  received: 'secondary',
  preparing: 'warning',
  ready: 'success',
  picked_up: 'default',
  cancelled: 'danger',
}

const noopSubscribe = () => () => {}

function orderDate(date: string) {
  return new Date(date).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CUSTOMER_TIME_ZONE,
  })
}

function itemsLabel(count: number) {
  return count === 1 ? '1 producto' : `${count} productos`
}

export function GuestOrders() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const orders = useSyncExternalStore(subscribeGuestOrders, getGuestOrdersSnapshot, () => EMPTY_GUEST_ORDERS)
  const active = orders.filter(isActiveGuestOrder)
  const activeKey = active.map((order) => order.id).join(',')

  // Saved statuses go stale once the page is closed, so re-read the active ones.
  useEffect(() => {
    if (!activeKey) return
    let cancelled = false
    const refs = getGuestOrdersSnapshot()
      .filter(isActiveGuestOrder)
      .map((order) => ({ id: order.id, token: order.token }))
    refreshGuestOrderStatuses(refs)
      .then((updates) => {
        if (!cancelled) updateGuestOrderStatuses(updates)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [activeKey])

  const current = active[0] ?? null
  const rest = orders.filter((order) => order.id !== current?.id)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-5 pb-28 pt-8">
        <h1 className="text-[2rem] font-medium leading-tight tracking-tight text-foreground">Tus pedidos</h1>
        <p className="mt-2 text-base text-muted-foreground">Los pedidos que has hecho desde este móvil.</p>

        {!hydrated ? (
          <div className="mt-8 space-y-3" aria-hidden="true">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-20 w-full rounded-3xl" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<Icon name="receipt" className="h-6 w-6" />}
              title="Aún no tienes pedidos"
              description="Cuando hagas tu primer pedido desde este móvil, aparecerá aquí."
              action={
                <Button asChild>
                  <Link href="/explore">Explorar cafeterías</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {current && <CurrentOrderCard order={current} />}

            {rest.length > 0 && (
              <section className="mt-8" aria-labelledby="guest-recent-orders">
                <h2 id="guest-recent-orders" className="text-sm font-semibold text-muted-foreground">
                  Pedidos recientes
                </h2>
                <ul className="mt-3 space-y-3">
                  {rest.map((order) => (
                    <li key={order.id}>
                      <RecentOrderRow order={order} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        <p className="mt-10 text-center text-sm text-muted-foreground">
          ¿Tienes cuenta?{' '}
          <Link href="/account/login" className="font-medium text-foreground underline underline-offset-4">
            Inicia sesión
          </Link>{' '}
          para guardar tus pedidos y sellos en todos tus dispositivos.
        </p>
      </div>
    </main>
  )
}

function CurrentOrderCard({ order }: { order: GuestOrder }) {
  return (
    <section className="mt-8" aria-labelledby="guest-current-order">
      <Card variant="flat">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="guest-current-order" className="text-lg font-medium text-foreground">
                Tu pedido en curso
              </h2>
              {order.shopName && <p className="mt-0.5 truncate text-sm text-muted-foreground">{order.shopName}</p>}
            </div>
            <Badge variant={statusVariant[order.status] ?? 'secondary'} className="shrink-0">
              {statusLabels[order.status] ?? order.status}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {orderDate(order.createdAt)} · {itemsLabel(order.itemCount)} ·{' '}
            <span className="tabular-nums text-foreground">{formatMoney(order.totalCents, order.currency)}</span>
          </p>
          <Button asChild className="mt-4 h-12 w-full">
            <Link href={guestOrderHref(order)}>Ver estado del pedido</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

function RecentOrderRow({ order }: { order: GuestOrder }) {
  return (
    <Link
      href={guestOrderHref(order)}
      className="flex min-h-16 items-center justify-between gap-3 rounded-3xl bg-surface px-4 py-3 transition-colors hover:bg-surface-elevated"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{order.shopName ?? 'Pedido'}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {orderDate(order.createdAt)} · {itemsLabel(order.itemCount)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-medium tabular-nums text-foreground">
          {formatMoney(order.totalCents, order.currency)}
        </span>
        <span className="text-xs text-muted-foreground">{statusLabels[order.status] ?? order.status}</span>
      </div>
    </Link>
  )
}
