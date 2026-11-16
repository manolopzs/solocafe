import type { Order, OrderStatus } from '@/types'

/** An order placed from this phone, kept so a guest can get back to its status page. */
export interface GuestOrder {
  id: string
  token: string
  shopSlug: string | null
  shopName: string | null
  status: OrderStatus
  totalCents: number
  currency: string
  itemCount: number
  createdAt: string
}

export const GUEST_ORDERS_KEY = 'solo-cafe.guest-orders'
export const MAX_GUEST_ORDERS = 10

const ACTIVE_STATUSES: readonly OrderStatus[] = ['received', 'preparing', 'ready']

export const EMPTY_GUEST_ORDERS: GuestOrder[] = []

export function isActiveGuestOrder(order: Pick<GuestOrder, 'status'>) {
  return ACTIVE_STATUSES.includes(order.status)
}

export function guestOrderHref(order: Pick<GuestOrder, 'id' | 'token'>) {
  return `/order/${encodeURIComponent(order.id)}?token=${encodeURIComponent(order.token)}`
}

export function guestOrderFromOrder(order: Order, token: string): GuestOrder {
  return {
    id: order.id,
    token,
    shopSlug: order.shop?.slug ?? order.shop_slug ?? null,
    shopName: order.shop?.name ?? order.shop_name ?? null,
    status: order.status,
    totalCents: order.total_cents,
    currency: order.currency,
    itemCount: order.item_count ?? (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.created_at,
  }
}

function isGuestOrder(value: unknown): value is GuestOrder {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    v.id.length > 0 &&
    typeof v.token === 'string' &&
    v.token.length > 0 &&
    typeof v.status === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.totalCents === 'number' &&
    typeof v.currency === 'string'
  )
}

function sortAndCap(orders: GuestOrder[]) {
  return [...orders]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, MAX_GUEST_ORDERS)
}

const listeners = new Set<() => void>()
let snapshot: GuestOrder[] = EMPTY_GUEST_ORDERS
let loaded = false

function readStored(): GuestOrder[] {
  if (typeof window === 'undefined') return EMPTY_GUEST_ORDERS
  try {
    const raw = window.localStorage.getItem(GUEST_ORDERS_KEY)
    if (!raw) return EMPTY_GUEST_ORDERS
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return EMPTY_GUEST_ORDERS
    return sortAndCap(parsed.filter(isGuestOrder))
  } catch {
    return EMPTY_GUEST_ORDERS
  }
}

function write(next: GuestOrder[]) {
  snapshot = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(next))
    } catch {
      // Storage full or blocked (private mode): keep the in-memory copy.
    }
  }
  listeners.forEach((listener) => listener())
}

export function getGuestOrdersSnapshot(): GuestOrder[] {
  if (!loaded) {
    snapshot = readStored()
    loaded = true
  }
  return snapshot
}

export function subscribeGuestOrders(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Insert or update an order (matched by id). Newest first, at most MAX_GUEST_ORDERS. */
export function rememberGuestOrder(order: GuestOrder): GuestOrder[] {
  const current = getGuestOrdersSnapshot()
  const existing = current.find((item) => item.id === order.id)
  if (existing && JSON.stringify(existing) === JSON.stringify(order)) return current
  const next = sortAndCap([order, ...current.filter((item) => item.id !== order.id)])
  write(next)
  return next
}

/** Apply fresh statuses (e.g. after re-fetching active orders). Unknown ids are ignored. */
export function updateGuestOrderStatuses(updates: { id: string; status: OrderStatus }[]): GuestOrder[] {
  const current = getGuestOrdersSnapshot()
  const byId = new Map(updates.map((update) => [update.id, update.status]))
  let changed = false
  const next = current.map((order) => {
    const status = byId.get(order.id)
    if (!status || status === order.status) return order
    changed = true
    return { ...order, status }
  })
  if (changed) write(next)
  return changed ? next : current
}
