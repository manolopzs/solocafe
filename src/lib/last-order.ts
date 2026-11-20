import type { Order } from '@/types'
import { customerReorderHref, guestReorderHref, type GuestOrder } from '@/lib/guest-orders'
import { getMenuItemCutout, storefrontItemName } from '@/lib/storefront-menu'

/** What the "Lo de siempre" card on Inicio needs. Built only from a real previous order. */
export interface LastOrder {
  id: string
  shopName: string | null
  /** e.g. "1 × Latte" */
  itemsSummary: string
  totalCents: number
  currency: string
  locale?: string
  /** Only when the order carried an estimate. */
  etaMinutes: number | null
  /** The same "Reorder" link the Orders tab uses (#48). */
  reorderHref: string
  /** A licensed cut-out matching the first item, if there is one. */
  cutout: string | null
}

// Cancelled or unpaid orders are not "lo de siempre".
const REPEATABLE = new Set(['received', 'preparing', 'ready', 'picked_up'])

function eta(minutes: number | undefined | null) {
  return minutes && minutes > 0 ? minutes : null
}

function firstItemName(summary: string) {
  const first = summary.split(',')[0]?.trim() ?? ''
  return first.replace(/^\d+\s*×\s*/, '')
}

function cutoutFor(name: string) {
  return name ? getMenuItemCutout({ name, image_url: null }) : null
}

/** Newest guest order on this phone that can be repeated, or null. */
export function lastGuestOrder(orders: readonly GuestOrder[]): LastOrder | null {
  for (const order of orders) {
    if (!REPEATABLE.has(order.status)) continue
    const reorderHref = guestReorderHref(order)
    if (!reorderHref || !order.itemsSummary) continue
    const summary = order.itemsSummary
    return {
      id: order.id,
      shopName: order.shopName,
      itemsSummary: summary,
      totalCents: order.totalCents,
      currency: order.currency,
      locale: order.locale,
      etaMinutes: eta(order.estimatedReadyMinutes),
      reorderHref,
      cutout: cutoutFor(firstItemName(summary)),
    }
  }
  return null
}

/** Newest account order that can be repeated, or null. */
export function lastCustomerOrder(orders: readonly Order[]): LastOrder | null {
  const sorted = [...orders].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
  for (const order of sorted) {
    if (!REPEATABLE.has(order.status)) continue
    const reorderHref = customerReorderHref(order)
    const items = order.items ?? []
    if (!reorderHref || items.length === 0) continue
    return {
      id: order.id,
      shopName: order.shop?.name ?? order.shop_name ?? null,
      itemsSummary: items.map((item) => `${item.quantity} × ${storefrontItemName(item.item_name_snapshot)}`).join(', '),
      totalCents: order.total_cents,
      currency: order.currency,
      locale: order.shop?.locale ?? 'es',
      etaMinutes: eta(order.estimated_ready_minutes),
      reorderHref,
      cutout: cutoutFor(items[0].item_name_snapshot),
    }
  }
  return null
}
