'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { EMPTY_GUEST_ORDERS, getGuestOrdersSnapshot, subscribeGuestOrders } from '@/lib/guest-orders'
import { lastGuestOrder, type LastOrder } from '@/lib/last-order'
import { formatMoney } from '@/lib/ordering'

/**
 * "Lo de siempre" on Inicio (mock b4): the last real order with one espresso button
 * that refills the bag through the existing "Repetir" link. Renders nothing without one.
 */
export function LoDeSiempre({ order }: { order: LastOrder | null }) {
  if (!order) return null
  const price = formatMoney(order.totalCents, order.currency)
  const meta = order.etaMinutes ? `${price} · listo en ~${order.etaMinutes} min` : price

  return (
    <section className="mt-6" aria-labelledby="lo-de-siempre" data-testid="lo-de-siempre">
      <div className="flex items-center gap-4 rounded-card bg-surface-elevated p-4 shadow-card ring-1 ring-border/60">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-thumb bg-surface">
          {order.cutout ? (
            <Image src={order.cutout} alt="" width={64} height={64} className="h-[82%] w-[82%] object-contain" />
          ) : (
            <Icon name="coffee" className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p id="lo-de-siempre" className="truncate text-caption text-muted-foreground">
            Lo de siempre{order.shopName ? ` · ${order.shopName}` : ''}
          </p>
          <p className="mt-0.5 truncate text-product text-foreground">{order.itemsSummary}</p>
          <p className="mt-0.5 text-body-sm text-muted-foreground tabular-nums">{meta}</p>
        </div>
      </div>
      <Button asChild variant="espresso" size="lg" className="mt-3 w-full text-button">
        <Link href={order.reorderHref}>
          <Icon name="repeat" className="h-5 w-5" />
          Pedir otra vez · {price}
        </Link>
      </Button>
    </section>
  )
}

/** Guest version: reads the orders this phone placed (localStorage), same list as Pedidos. */
export function GuestLoDeSiempre() {
  const orders = useSyncExternalStore(subscribeGuestOrders, getGuestOrdersSnapshot, () => EMPTY_GUEST_ORDERS)
  return <LoDeSiempre order={lastGuestOrder(orders)} />
}
