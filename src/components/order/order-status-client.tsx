'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { getOrderWithItems } from '@/server/queries/orders'
import { CUSTOMER_TIME_ZONE, formatMoney, formatPickupWindow } from '@/lib/ordering'
import { PickupCode } from '@/components/order/pickup-code'
import { env } from '@/lib/env'
import { Button } from '@/components/ui/button'
import { StampCard } from '@/components/order/stamp-card'
import { OrderReadyScreen, showsReadyScreen } from '@/components/order/order-ready-screen'
import { PhosphorIcon } from '@/components/icons/phosphor'
import type { Order, OrderItem, OrderItemModifier, OrderStatus } from '@/types'

const statusLabels: Record<'received' | 'preparing' | 'ready' | 'picked_up', string> = {
  received: 'Ordered',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked up',
}

const statusSteps: Array<'received' | 'preparing' | 'ready' | 'picked_up'> = ['received', 'preparing', 'ready', 'picked_up']

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
  paymentReturn = false,
}: {
  initialOrder: Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }
  accessToken?: string
  vapidPublicKey?: string | null
  paymentReturn?: boolean
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
      new Notification('Your order is ready', {
        body: 'Come pick it up.',
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
  const shopName = order.shop?.name
  const timeZone = order.shop?.timezone || CUSTOMER_TIME_ZONE
  const windowLabel =
    order.pickup_window_starts_at && order.pickup_window_ends_at
      ? formatPickupWindow(order.pickup_window_starts_at, order.pickup_window_ends_at, timeZone)
      : null
  const etaMinutes = order.estimated_ready_minutes && order.estimated_ready_minutes > 0 ? order.estimated_ready_minutes : null
  const menuHref = order.shop?.slug ? `/${order.shop.slug}` : '/'
  const confirmingPayment = paymentReturn && order.status === 'pending_payment'

  if (showsReadyScreen(order.status)) return <OrderReadyScreen order={order} menuHref={menuHref} />

  return (
    <main className="min-h-screen bg-background">
      <div className="pb-tabs phone-col px-5 pt-1">
        <Link href={menuHref} className="-ml-1 inline-flex min-h-12 items-center gap-2 px-1 text-body-sm font-medium text-foreground">
          <PhosphorIcon name="arrow-left" className="h-[18px] w-[18px]" />
          Back to menu
        </Link>

        <section className="mt-3 rounded-card border border-border bg-surface-elevated p-5 shadow-card">
          {shopName && (
            <p className="flex items-center gap-2 text-body-sm font-semibold text-foreground">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pill text-on-pill">
                <PhosphorIcon name="storefront" className="h-4 w-4" />
              </span>
              {shopName}
            </p>
          )}
          <h1 className="mt-3 text-h1s text-heading">
            {confirmingPayment ? 'Confirming your payment' : headline(order.status)}
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            {confirmingPayment ? 'It takes a few seconds. This page updates on its own.' : subhead(order.status)}
          </p>

          {order.status === 'cancelled' ? (
            <div className="mt-4">
              <Button asChild variant="espresso" size="lg" className="w-full">
                <Link href={menuHref}>Order again</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-5">
                <StatusProgress progressIndex={progressIndex} finished={order.status === 'picked_up'} />
                <ol className="mt-3 grid grid-cols-4">
                  {statusSteps.map((step, index) => {
                    const state = stepState(index, progressIndex, order.status === 'picked_up')
                    return (
                      <li
                        key={step}
                        className={[
                          'flex flex-col gap-2',
                          index === 0 ? 'items-start' : index === statusSteps.length - 1 ? 'items-end' : 'items-center',
                        ].join(' ')}
                        data-state={state}
                      >
                        <StepMark state={state} number={index + 1} />
                        <span className={['text-body-sm', state === 'current' ? 'font-semibold text-foreground' : state === 'done' ? 'text-foreground' : 'text-on-pill'].join(' ')}>
                          {statusLabels[step]}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>
              {etaMinutes != null && (
                <p className="mt-4 text-body-sm text-muted-foreground">
                  Ready in about {etaMinutes} min
                </p>
              )}
            </>
          )}
        </section>

        {order.status !== 'cancelled' && (
          <>
            <PickupCode orderId={order.id} size="md" className="mt-5" />

            <section className="mt-5 rounded-card border border-border bg-surface-elevated p-5 shadow-card" data-testid="order-status-card">
              <p className="text-eyebrow uppercase text-on-pill">Pick up at</p>
              {shopName && <p className="mt-2 text-h3 text-foreground">{shopName}</p>}
              {order.shop?.address && <p className="mt-0.5 text-body-sm text-muted-foreground">{order.shop.address}</p>}
              {windowLabel && <p className="mt-2 text-body-sm font-semibold text-foreground">{windowLabel}</p>}
              <p className="mt-3 flex items-center gap-2 text-body-sm text-foreground">
                <PhosphorIcon name="storefront" className="h-4 w-4 shrink-0" />
                Come to the counter and say your code.
              </p>
              {order.shop?.directions_url && (
                <Button asChild variant="outline" className="mt-4 w-full">
                  <a href={order.shop.directions_url} target="_blank" rel="noreferrer">
                    <PhosphorIcon name="map-pin" className="mr-2 h-4 w-4" />
                    Directions
                  </a>
                </Button>
              )}
            </section>
          </>
        )}

        {order.loyalty && (
          <div className="mt-4">
            <StampCard loyalty={order.loyalty} />
            {order.loyalty_redeemed && (
              <p className="mt-2 text-sm text-muted-foreground">You redeemed your reward on this order.</p>
            )}
          </div>
        )}

        {order.status === 'pending_payment' && !confirmingPayment && accessToken && (
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href={`/checkout/${order.id}?token=${encodeURIComponent(accessToken)}`}>Complete payment</Link>
          </Button>
        )}

        {notificationPermission === 'default' && order.status !== 'cancelled' && order.status !== 'picked_up' && (
          <Button variant="outline" className="mt-3 w-full border-[1.5px]" onClick={() => void requestNotification()}>
            <span className="inline-flex items-center gap-2">
              <PhosphorIcon name="bell" className="h-[18px] w-[18px]" />
              Notify me when it&apos;s ready
            </span>
          </Button>
        )}

        <section className="mt-8">
          <h2 className="text-eyebrow uppercase text-on-pill">Your order</h2>
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
                <span>Reward</span>
                <span className="tabular-nums">-{formatMoney(order.discount_cents ?? 0, order.currency, order.shop?.locale)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-medium tabular-nums text-foreground">{formatMoney(order.total_cents, order.currency, order.shop?.locale)}</span>
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
      return 'Payment pending'
    case 'ready':
      return 'Your order is ready'
    case 'picked_up':
      return 'Order picked up'
    case 'cancelled':
      return 'Order cancelled'
    case 'received':
      return 'We have received your order'
    default:
      return 'We are preparing your order'
  }
}

function subhead(status: OrderStatus) {
  switch (status) {
    case 'pending_payment':
      return 'Complete the payment so the kitchen receives your order.'
    case 'ready':
      return 'Come pick it up.'
    case 'picked_up':
      return 'Thanks for visiting.'
    case 'cancelled':
      return 'This order was cancelled.'
    default:
      return 'We will update this page when it is ready.'
  }
}

type StepState = 'done' | 'current' | 'next'

function stepState(index: number, progressIndex: number, finished: boolean): StepState {
  if (finished || index < progressIndex) return 'done'
  if (index === progressIndex) return 'current'
  return 'next'
}

/** Done: check on espresso. Current: espresso disc with a breathing sky dot. Next: 1.5px ring with its number. */
function StepMark({ state, number }: { state: StepState; number: number }) {
  if (state === 'done') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
        <PhosphorIcon name="check" className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (state === 'current') {
    return (
      <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-foreground" aria-current="step">
        <span className="animate-halo absolute -inset-[5px] rounded-full bg-sky" aria-hidden="true" />
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-foreground">
          <span className="h-2 w-2 rounded-full bg-sky" />
        </span>
      </span>
    )
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-muted-foreground bg-surface-elevated text-xs font-semibold text-on-pill">
      {number}
    </span>
  )
}

/** Four 6px segments, 4 apart, inside the card. Decorative: the steps carry the state. */
function StatusProgress({ progressIndex, finished }: { progressIndex: number; finished: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-1" aria-hidden="true">
      {statusSteps.map((step, index) => {
        const state = stepState(index, progressIndex, finished)
        return (
          <span key={step} className="h-1.5 overflow-hidden rounded-full bg-pill">
            <span
              className={[
                'block h-full rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)]',
                state === 'done' ? 'w-full bg-foreground' : state === 'current' ? 'w-full bg-gradient-to-r from-foreground from-40% to-sky to-40%' : 'w-0',
              ].join(' ')}
            />
          </span>
        )
      })}
    </div>
  )
}
