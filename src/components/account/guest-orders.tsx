'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { CUSTOMER_HOME_PATH } from '@/lib/site'
import { Skeleton } from '@/components/ui/skeleton'
import {
  EMPTY_GUEST_ORDERS,
  getGuestOrdersSnapshot,
  guestOrderHref,
  guestReorderHref,
  isActiveGuestOrder,
  subscribeGuestOrders,
  updateGuestOrderStatuses,
  type GuestOrder,
} from '@/lib/guest-orders'
import { CUSTOMER_TIME_ZONE, formatMoney } from '@/lib/ordering'
import { pickupCode } from '@/lib/pickup-code'
import { refreshGuestOrderStatuses } from '@/server/actions/guest-orders'

const statusLabels: Record<string, string> = {
  pending_payment: 'Payment pending',
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked up',
  cancelled: 'Cancelled',
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
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: CUSTOMER_TIME_ZONE,
  })
}

function itemsLabel(count: number) {
  return count === 1 ? '1 item' : `${count} items`
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
      <div className="mx-auto max-w-xl pb-28 pt-8">
        <div className="px-5">
          <h1 className="text-[2rem] font-medium leading-tight tracking-tight text-foreground">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Orders placed from this phone.</p>
        </div>

        {!hydrated ? (
          <div className="mt-6 space-y-3 px-5" aria-hidden="true">
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 px-5">
            <EmptyState
              icon={<Icon name="receipt" className="h-6 w-6" />}
              title="You don't have any orders yet"
              description="When you place your first order from this phone, it will appear here."
              action={
                <Button asChild>
                  <Link href={CUSTOMER_HOME_PATH}>Place an order</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {current && <CurrentOrderCard order={current} />}

            {rest.length > 0 && (
              <section className="mt-8" aria-labelledby="guest-past-orders">
                <h2
                  id="guest-past-orders"
                  className="px-5 pb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  Past
                </h2>
                <ul>
                  {rest.map((order) => (
                    <li key={order.id} className="border-t border-border">
                      <PastOrderRow order={order} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        <p className="mt-6 px-5 text-sm leading-6 text-muted-foreground">
          Saved only on this phone.{' '}
          <Link href="/account/signup" className="font-semibold text-accent underline underline-offset-4">
            Sign up
          </Link>{' '}
          to see them anywhere.
        </p>
      </div>
    </main>
  )
}

function orderSummary(order: GuestOrder) {
  return order.itemsSummary || itemsLabel(order.itemCount)
}

function CurrentOrderCard({ order }: { order: GuestOrder }) {
  return (
    <section className="mx-5 mt-6 rounded-3xl bg-surface p-5" aria-labelledby="guest-current-order">
      <p id="guest-current-order" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Your order in progress
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xl font-semibold text-foreground">{order.shopName ?? 'Your order'}</p>
        <Badge variant={statusVariant[order.status] ?? 'secondary'} className="shrink-0">
          {statusLabels[order.status] ?? order.status}
        </Badge>
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="min-w-0 text-[0.95rem] leading-6 text-muted-foreground">
          {orderSummary(order)} ·{' '}
          <span className="tabular-nums">{formatMoney(order.totalCents, order.currency, order.locale)}</span>
        </p>
        <p className="shrink-0 text-right">
          <span className="sr-only">Pickup code </span>
          <span className="text-4xl font-semibold tabular-nums tracking-[0.08em] text-foreground">
            {pickupCode(order.id)}
          </span>
        </p>
      </div>
      <Button asChild className="mt-4 h-14 w-full rounded-full text-base">
        <Link href={guestOrderHref(order)}>View tracking</Link>
      </Button>
    </section>
  )
}

function PastOrderRow({ order }: { order: GuestOrder }) {
  const reorderHref = guestReorderHref(order)
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 px-5 py-3">
      <Link href={guestOrderHref(order)} className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">
          {orderSummary(order)} ·{' '}
          <span className="tabular-nums">{formatMoney(order.totalCents, order.currency, order.locale)}</span>
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {[order.shopName, orderDate(order.createdAt), statusLabels[order.status] ?? order.status]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </Link>
      {reorderHref && (
        <Link
          href={reorderHref}
          className="inline-flex min-h-11 shrink-0 items-center px-1 text-base font-semibold text-accent underline underline-offset-4"
          aria-label={`Reorder from ${order.shopName ?? 'this coffee shop'}`}
        >
          Reorder
        </Link>
      )}
    </div>
  )
}
