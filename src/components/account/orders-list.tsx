'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PhosphorIcon } from '@/components/icons/phosphor'
import { CUSTOMER_HOME_PATH } from '@/lib/site'
import { formatMoney } from '@/lib/ordering'
import { customerReorderHref } from '@/lib/guest-orders'
import { pickupCode } from '@/lib/pickup-code'
import { groupOrdersByDate, isActiveOrder, partitionOrders } from '@/lib/order-groups'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import type { Order } from '@/types'

const statusLabels: Record<string, string> = {
  pending_payment: 'Payment pending',
  received: 'Received',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked up',
  cancelled: 'Cancelled',
}

function orderHref(order: Order): string {
  const token = order.access_token
  const base = `/order/${order.id}`
  return token ? `${base}?token=${encodeURIComponent(token)}` : base
}

export function OrdersList({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<'active' | 'past'>('active')
  const { active, past } = useMemo(() => partitionOrders(orders), [orders])
  const displayed = tab === 'active' ? active : past
  const grouped = useMemo(() => groupOrdersByDate(displayed), [displayed])
  const lastShopSlug = orders[0]?.shop?.slug
  const emptyHref = lastShopSlug ? `/${lastShopSlug}` : CUSTOMER_HOME_PATH

  return (
    <main className="min-h-screen bg-background">
      <div className="phone-col px-5 pb-24">
        <div className="flex h-14 items-center">
          <SoloCafeWordmark height={20} />
        </div>
        <h1 className="mt-2 text-h1 text-heading">Orders</h1>
        <p className="mt-2 text-body text-muted-foreground">Order history at coffee shops that use Solo Café.</p>

        <div className="mt-6 inline-flex rounded-full bg-pill p-1">
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

        <div className="mt-6 space-y-6">
          {displayed.length === 0 ? (
            <EmptyState
              icon={<PhosphorIcon name="receipt" className="h-6 w-6" />}
              title={tab === 'active' ? 'No active orders' : 'No orders yet'}
              description={tab === 'active' ? 'You have no orders in progress.' : 'When you place your first order, it will appear here.'}
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
                      <OrderRow order={order} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

function OrderRow({ order }: { order: Order }) {
  const active = isActiveOrder(order)
  const reorderHref = customerReorderHref(order)
  const href = orderHref(order)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated p-3 shadow-card">
      <Link href={href} className="shrink-0">
        <span className={['flex h-10 w-10 items-center justify-center rounded-full bg-pill', active ? 'text-on-pill' : 'text-muted-foreground'].join(' ')}>
          <PhosphorIcon name="storefront" className="h-5 w-5" />
        </span>
      </Link>
      <Link href={href} className="min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated">
        <p className={['truncate text-base font-semibold leading-[22px]', active ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>{order.shop?.name ?? 'Your order'}</p>
        <p className={['text-body-sm text-muted-foreground', active ? 'truncate' : ''].join(' ')}>
          {statusLabels[order.status] ?? order.status}
          {active && <> · Code {pickupCode(order.id)}</>}
        </p>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={['text-sm font-semibold tabular-nums', active ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
          {formatMoney(order.total_cents, order.currency, order.shop?.locale)}
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
