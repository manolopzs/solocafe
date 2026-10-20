'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { getOrderWithItems } from '@/server/queries/orders'
import { formatMoney, formatPickupWindow } from '@/lib/ordering'
import { Button } from '@/components/ui/button'
import { StampCard } from '@/components/order/stamp-card'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import type { Order, OrderItem, OrderItemModifier, OrderStatus } from '@/types'

const statusLabels: Record<'received' | 'preparing' | 'ready', string> = {
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo',
}

const statusSteps: Array<'received' | 'preparing' | 'ready'> = ['received', 'preparing', 'ready']

function subscribeNotificationPermission() {
  return () => {}
}

function readNotificationPermission(): NotificationPermission | 'unsupported' {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

export function OrderStatusClient({
  initialOrder,
  accessToken,
}: {
  initialOrder: Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }
  accessToken?: string
}) {
  const [order, setOrder] = useState(initialOrder)
  const [permissionOverride, setPermissionOverride] = useState<NotificationPermission | null>(null)
  const systemPermission = useSyncExternalStore(
    subscribeNotificationPermission,
    readNotificationPermission,
    () => 'default' as NotificationPermission
  )
  const notificationPermission = permissionOverride ?? systemPermission
  const previousStatusRef = useRef(order.status)

  useEffect(() => {
    if (
      notificationPermission === 'granted' &&
      previousStatusRef.current !== 'ready' &&
      order.status === 'ready'
    ) {
      new Notification('Tu pedido está listo', {
        body: 'Pasa a recogerlo.',
      })
    }
    previousStatusRef.current = order.status
  }, [order.status, notificationPermission])

  useEffect(() => {
    if (order.status === 'picked_up' || order.status === 'cancelled') return

    const fetchOrder = async () => {
      const updated = await getOrderWithItems(order.id, accessToken)
      if (updated) setOrder(updated)
    }

    const interval = setInterval(() => void fetchOrder(), 5000)
    return () => clearInterval(interval)
  }, [order.id, order.status, accessToken])

  const requestNotification = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setPermissionOverride(permission)
  }

  const progressIndex = order.status === 'picked_up' ? statusSteps.length - 1 : statusSteps.indexOf(order.status as 'received')
  const itemCount = order.item_count ?? order.items.reduce((sum, item) => sum + item.quantity, 0)
  const shopName = order.shop?.name
  const timeZone = order.shop?.timezone || 'America/Mexico_City'
  const windowLabel =
    order.pickup_window_starts_at && order.pickup_window_ends_at
      ? formatPickupWindow(order.pickup_window_starts_at, order.pickup_window_ends_at, timeZone)
      : null
  const showSteps = order.status !== 'cancelled' && order.status !== 'pending_payment'
  const menuHref = order.shop?.slug ? `/${order.shop.slug}` : '/'

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-xl">
        <Link href={menuHref} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="arrow-left" className="h-4 w-4" />
          Volver al menú
        </Link>

        <div className="text-center">
          <div
            className={[
              'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
              order.status === 'ready' || order.status === 'picked_up'
                ? 'bg-sage-100 text-sage-600'
                : order.status === 'cancelled'
                  ? 'bg-danger/10 text-danger'
                  : 'bg-amber-100 text-amber-600',
            ].join(' ')}
          >
            <Icon name={order.status === 'ready' || order.status === 'picked_up' ? 'check' : 'clock'} className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground">{headline(order.status)}</h1>
          <p className="mt-2 text-muted-foreground">{subhead(order.status)}</p>
        </div>

        {showSteps && (
          <Card variant="outline" className="mt-8 overflow-hidden">
            <CardContent className="p-5">
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const done = index <= progressIndex
                  const active = index === progressIndex
                  return (
                    <div key={step} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                      <div
                        className={[
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                          done ? 'bg-foreground text-primary-foreground' : 'border border-border bg-surface text-muted-foreground',
                          active ? 'ring-2 ring-accent ring-offset-2' : '',
                        ].join(' ')}
                      >
                        {done ? <Icon name="check" className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className={['text-center text-[0.65rem] font-medium sm:text-xs', done ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
                        {statusLabels[step]}
                      </span>
                    </div>
                  )
                })}
                <div className="absolute left-0 right-0 top-4 -z-0 h-0.5 bg-border">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${(Math.max(0, progressIndex) / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(windowLabel || shopName) && order.status !== 'cancelled' && (
          <Card variant="outline" className="mt-4 overflow-hidden">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-medium text-foreground">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                {shopName ? ` · ${shopName}` : ''}
              </p>
              {windowLabel && <p className="text-lg font-semibold text-foreground">{windowLabel}</p>}
              {order.shop?.directions_url && (
                <Button asChild variant="outline" className="w-full">
                  <a href={order.shop.directions_url} target="_blank" rel="noreferrer">
                    <Icon name="map-pin" className="mr-2 h-4 w-4" />
                    Cómo llegar
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {order.loyalty && (
          <div className="mt-4">
            <StampCard loyalty={order.loyalty} />
            {order.loyalty_redeemed && (
              <p className="mt-2 text-sm text-muted-foreground">Canjeaste tu recompensa en este pedido.</p>
            )}
          </div>
        )}

        {order.status === 'pending_payment' && accessToken && (
          <Button asChild size="lg" className="mt-4 w-full">
            <Link href={`/checkout/${order.id}?token=${encodeURIComponent(accessToken)}`}>Completar pago</Link>
          </Button>
        )}

        {notificationPermission === 'default' && order.status !== 'cancelled' && order.status !== 'picked_up' && (
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => void requestNotification()}>
            <Icon name="bell" className="mr-2 h-4 w-4" />
            Avísame cuando esté listo
          </Button>
        )}

        <Card variant="outline" className="mt-6 overflow-hidden">
          <div className="border-b border-border bg-surface px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detalle del pedido</p>
          </div>
          <CardContent className="p-5">
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {item.quantity}x {item.item_name_snapshot}
                    </p>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.modifiers.map((modifier) => modifier.option_name_snapshot).join(', ')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              {(order.discount_cents ?? 0) > 0 && (
                <div className="flex justify-between text-foreground">
                  <span>Recompensa</span>
                  <span>-{formatMoney(order.discount_cents ?? 0, order.currency)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{formatMoney(order.total_cents, order.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function headline(status: OrderStatus) {
  switch (status) {
    case 'pending_payment':
      return 'Pago pendiente'
    case 'ready':
      return 'Tu pedido está listo'
    case 'picked_up':
      return 'Pedido entregado'
    case 'cancelled':
      return 'Pedido cancelado'
    case 'received':
      return 'Recibimos tu pedido'
    default:
      return 'Estamos preparando tu pedido'
  }
}

function subhead(status: OrderStatus) {
  switch (status) {
    case 'pending_payment':
      return 'Completa el pago para que la cocina reciba tu pedido.'
    case 'ready':
      return 'Pasa a recogerlo.'
    case 'picked_up':
      return 'Gracias por tu visita.'
    case 'cancelled':
      return 'Este pedido fue cancelado.'
    default:
      return 'Te avisamos en esta página cuando esté listo.'
  }
}
