'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { getOrderWithItems } from '@/server/queries/orders'
import { CUSTOMER_TIME_ZONE, formatMoney, formatPickupWindow } from '@/lib/ordering'
import { env } from '@/lib/env'
import { Button } from '@/components/ui/button'
import { StampCard } from '@/components/order/stamp-card'
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

async function registerCustomerPush(orderId: string, accessToken: string | undefined, vapidPublicKey: string | null) {
  if (!vapidPublicKey || !accessToken) return
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  const registration = await navigator.serviceWorker.register('/order/sw.js', { scope: '/order/' })
  const existing = await registration.pushManager.getSubscription()
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey(vapidPublicKey),
  })
  const json = subscription.toJSON()
  const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' })
  headers.set('X-Order-Token', accessToken)
  await fetch(`${env.NEXT_PUBLIC_API_URL}/public/orders/${orderId}/push_devices?token=${encodeURIComponent(accessToken)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      push_device: {
        platform: 'web',
        endpoint: subscription.endpoint,
        keys: {
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        },
      },
    }),
  })
}

function applicationServerKey(vapidPublicKey: string): ArrayBuffer {
  const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4)
  const base64 = (vapidPublicKey + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buffer = new ArrayBuffer(raw.length)
  const output = new Uint8Array(buffer)
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index)
  }
  return buffer
}

export function OrderStatusClient({
  initialOrder,
  accessToken,
  vapidPublicKey = null,
}: {
  initialOrder: Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }
  accessToken?: string
  vapidPublicKey?: string | null
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
    if (permission !== 'granted') return
    try {
      await registerCustomerPush(order.id, accessToken, vapidPublicKey)
    } catch {
      // The page still updates live if push registration fails.
    }
  }

  const progressIndex = order.status === 'picked_up' ? statusSteps.length - 1 : statusSteps.indexOf(order.status as 'received')
  const itemCount = order.item_count ?? order.items.reduce((sum, item) => sum + item.quantity, 0)
  const shopName = order.shop?.name
  const timeZone = order.shop?.timezone || CUSTOMER_TIME_ZONE
  const windowLabel =
    order.pickup_window_starts_at && order.pickup_window_ends_at
      ? formatPickupWindow(order.pickup_window_starts_at, order.pickup_window_ends_at, timeZone)
      : null
  const showSteps = order.status !== 'cancelled' && order.status !== 'pending_payment'
  const menuHref = order.shop?.slug ? `/${order.shop.slug}` : '/'

  const tone =
    order.status === 'ready' || order.status === 'picked_up'
      ? 'bg-success/15 text-success'
      : order.status === 'cancelled'
        ? 'bg-danger/10 text-danger'
        : 'bg-accent/15 text-accent'

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-5 sm:pt-8">
        <Link href={menuHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="arrow-left" className="h-4 w-4" />
          Volver al menú
        </Link>

        <div className="mt-8 flex items-start gap-4">
          <div className={['flex h-14 w-14 shrink-0 items-center justify-center rounded-full', tone].join(' ')}>
            <Icon name={order.status === 'ready' || order.status === 'picked_up' ? 'check' : 'clock'} className="h-7 w-7" />
          </div>
          <div>
            {shopName && <p className="text-sm font-medium text-accent">{shopName}</p>}
            <h1 className="mt-1 text-[2rem] font-medium leading-tight tracking-tight text-foreground">{headline(order.status)}</h1>
            <p className="mt-2 text-base leading-6 text-muted-foreground">{subhead(order.status)}</p>
          </div>
        </div>

        <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Código de recogida</p>
        <p className="mt-1 text-4xl font-medium tracking-[0.18em] text-foreground">{order.id.slice(-6).toUpperCase()}</p>

        {showSteps && (
          <div className="relative mt-8 flex justify-between">
            {statusSteps.map((step, index) => {
              const done = index <= progressIndex
              const active = index === progressIndex && order.status !== 'picked_up'
              return (
                <div key={step} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                  <div
                    className={[
                      'flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors',
                      done ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted-foreground',
                      active ? 'animate-soft-pulse ring-4 ring-primary/20' : '',
                    ].join(' ')}
                  >
                    {done ? <Icon name="check" className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={['text-center text-xs', done ? 'font-medium text-foreground' : 'text-muted-foreground'].join(' ')}>
                    {statusLabels[step]}
                  </span>
                </div>
              )
            })}
            <div className="absolute left-8 right-8 top-[18px] -z-0 h-0.5 bg-border">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(Math.max(0, progressIndex) / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {(windowLabel || shopName) && order.status !== 'cancelled' && (
          <section className="mt-8 rounded-3xl bg-surface px-5 py-5">
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </p>
            {windowLabel && <p className="mt-1 text-xl font-medium tracking-tight text-foreground">{windowLabel}</p>}
            {order.shop?.address && <p className="mt-2 text-sm text-muted-foreground">{order.shop.address}</p>}
            {order.shop?.directions_url && (
              <Button asChild variant="outline" className="mt-4 w-full">
                <a href={order.shop.directions_url} target="_blank" rel="noreferrer">
                  <Icon name="map-pin" className="mr-2 h-4 w-4" />
                  Cómo llegar
                </a>
              </Button>
            )}
          </section>
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
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href={`/checkout/${order.id}?token=${encodeURIComponent(accessToken)}`}>Completar pago</Link>
          </Button>
        )}

        {notificationPermission === 'default' && order.status !== 'cancelled' && order.status !== 'picked_up' && (
          <Button variant="outline" className="mt-4 w-full" onClick={() => void requestNotification()}>
            <Icon name="bell" className="mr-2 h-4 w-4" />
            Avísame cuando esté listo
          </Button>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Tu pedido</h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <li key={item.id} className="py-3.5">
                <p className="font-medium text-foreground">
                  {item.quantity} × {item.item_name_snapshot}
                </p>
                {item.modifiers && item.modifiers.length > 0 && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.modifiers.map((modifier) => modifier.option_name_snapshot).join(', ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-sm">
            {(order.discount_cents ?? 0) > 0 && (
              <div className="flex justify-between text-foreground">
                <span>Recompensa</span>
                <span className="tabular-nums">-{formatMoney(order.discount_cents ?? 0, order.currency)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-medium tabular-nums text-foreground">{formatMoney(order.total_cents, order.currency)}</span>
            </div>
          </div>
        </section>
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
