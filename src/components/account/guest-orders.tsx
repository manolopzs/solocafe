'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PhosphorIcon } from '@/components/icons/phosphor'
import { CUSTOMER_HOME_PATH } from '@/lib/site'
import { Skeleton } from '@/components/ui/skeleton'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import {
  EMPTY_GUEST_ORDERS,
  getGuestOrdersSnapshot,
  guestOrderHref,
  guestReorderHref,
  subscribeGuestOrders,
  updateGuestOrderStatuses,
  type GuestOrder,
} from '@/lib/guest-orders'
import { CUSTOMER_TIME_ZONE, formatMoney } from '@/lib/ordering'
import { pickupCode } from '@/lib/pickup-code'
import { groupOrdersByDate, isActiveOrder, partitionOrders } from '@/lib/order-groups'
import { refreshGuestOrderStatuses } from '@/server/actions/guest-orders'

const statusLabels: Record<string, string> = {
  pending_payment: 'Payment pending',
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked up',
  cancelled: 'Cancelled',
}

const noopSubscribe = () => () => {}

function orderDateLabel(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: CUSTOMER_TIME_ZONE,
  })
}

export function GuestOrders() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const orders = useSyncExternalStore(subscribeGuestOrders, getGuestOrdersSnapshot, () => EMPTY_GUEST_ORDERS)
  const [tab, setTab] = useState<'active' | 'past'>('active')
  const { active, past } = useMemo(() => partitionOrders(orders), [orders])
  const displayed = tab === 'active' ? active : past
  const grouped = useMemo(() => groupOrdersByDate(displayed), [displayed])
  const activeIds = active.map((order) => order.id).join(',')

  // Saved statuses go stale once the page is closed, so re-read the active ones.
  useEffect(() => {
    if (!activeIds) return
    let cancelled = false
    const refs = getGuestOrdersSnapshot()
      .filter(isActiveOrder)
      .map((order) => ({ id: order.id, token: order.token }))
    refreshGuestOrderStatuses(refs)
      .then((updates) => {
        if (!cancelled) updateGuestOrderStatuses(updates)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [activeIds])

  const lastShopSlug = orders[0]?.shopSlug
  const emptyHref = lastShopSlug ? `/${lastShopSlug}` : CUSTOMER_HOME_PATH

  return (
    <main className="min-h-screen bg-background">
      <div className="phone-col pb-28">
        <div className="flex h-14 items-center px-5">
          <SoloCafeWordmark height={20} />
        </div>
        <div className="px-5">
          <h1 className="mt-2 text-h1 text-heading">Orders</h1>
          <p className="mt-2 text-body text-muted-foreground">Orders placed from this phone.</p>
        </div>

        {!hydrated ? (
          <div className="mt-6 space-y-3 px-5" aria-hidden="true">
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="mt-6 px-5">
              <div className="inline-flex rounded-full bg-pill p-1">
                {[
                  { key: 'active', label: 'Active' },
                  { key: 'past', label: 'Past' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key as 'active' | 'past')}
                    className={[
                      'flex min-h-11 items-center rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-pill',
                      tab === item.key ? 'bg-foreground text-background' : 'text-on-pill',
                    ].join(' ')}
                    aria-pressed={tab === item.key}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-6 px-5">
              {orders.length === 0 ? (
                <EmptyState
                  icon={<PhosphorIcon name="receipt" className="h-6 w-6" />}
                  title="No orders yet"
                  description="When you place your first order from this phone, it will appear here."
                  action={
                    <Button asChild>
                      <Link href={emptyHref}>Order a coffee</Link>
                    </Button>
                  }
                />
              ) : displayed.length === 0 ? (
                <EmptyState
                  icon={<PhosphorIcon name="receipt" className="h-6 w-6" />}
                  title={tab === 'active' ? 'No active orders' : 'No past orders'}
                  description={tab === 'active' ? 'You have no orders in progress.' : 'Your past orders will appear here.'}
                  action={
                    <Button asChild>
                      <Link href={emptyHref}>Order a coffee</Link>
                    </Button>
                  }
                />
              ) : (
                grouped.map(({ label, items }) => (
                  <section key={`${tab}-${label}`}>
                    <h2 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">{label}</h2>
                    <ul className="mt-3 space-y-3">
                      {items.map((order) => (
                        <li key={order.id}>
                          <GuestOrderRow order={order} showDate={label !== 'Today' && label !== 'Yesterday'} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
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

function GuestOrderRow({ order, showDate }: { order: GuestOrder; showDate: boolean }) {
  const active = isActiveOrder(order)
  const reorderHref = guestReorderHref(order)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-3 shadow-card">
      <Link href={guestOrderHref(order)} className="shrink-0">
        <span className={['flex h-10 w-10 items-center justify-center rounded-full bg-pill', active ? 'text-on-pill' : 'text-muted-foreground'].join(' ')}>
          <PhosphorIcon name="storefront" className="h-5 w-5" />
        </span>
      </Link>
      <Link href={guestOrderHref(order)} className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated rounded-lg">
        <p className={['truncate text-base font-semibold leading-[22px]', active ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>{order.shopName ?? 'Your order'}</p>
        {order.itemsSummary && (
          <p className={['truncate text-body-sm', active ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>{order.itemsSummary}</p>
        )}
        <p className={['text-body-sm text-muted-foreground', active ? 'truncate' : ''].join(' ')}>
          {showDate && <>{orderDateLabel(order.createdAt)} · </>}
          <span>{statusLabels[order.status] ?? order.status}</span>
          {active && <> · Code {pickupCode(order.id)}</>}
        </p>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={['text-sm font-semibold tabular-nums', active ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
          {formatMoney(order.totalCents, order.currency, order.locale)}
        </span>
        {!active && reorderHref && (
          <Button asChild variant="outline" size="sm" className="min-h-11 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated">
            <Link href={reorderHref}>Order again</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
