import { CUSTOMER_TIME_ZONE } from '@/lib/ordering'

type OrderLike = {
  id: string
  created_at?: string
  createdAt?: string
  status: string
}

const ACTIVE_STATUSES = new Set(['pending_payment', 'received', 'preparing', 'ready'])

export function isActiveOrder(order: Pick<OrderLike, 'status'>) {
  return ACTIVE_STATUSES.has(order.status)
}

function orderCreatedAt(order: OrderLike): string {
  return order.created_at ?? order.createdAt ?? new Date().toISOString()
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime()
}

function isYesterday(date: Date, now: Date) {
  const yesterday = startOfDay(now)
  yesterday.setDate(yesterday.getDate() - 1)
  return startOfDay(date).getTime() === yesterday.getTime()
}

export function groupOrdersByDate<T extends OrderLike>(orders: T[]) {
  const now = new Date()
  const groups = new Map<string, T[]>()

  for (const order of orders) {
    const date = new Date(orderCreatedAt(order))
    let label: string
    if (isSameDay(date, now)) {
      label = 'Today'
    } else if (isYesterday(date, now)) {
      label = 'Yesterday'
    } else {
      label = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: now.getFullYear() === date.getFullYear() ? undefined : 'numeric',
        timeZone: CUSTOMER_TIME_ZONE,
      })
    }
    const existing = groups.get(label) ?? []
    existing.push(order)
    groups.set(label, existing)
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
}

export function partitionOrders<T extends OrderLike>(orders: T[]) {
  const active: T[] = []
  const past: T[] = []
  for (const order of orders) {
    if (isActiveOrder(order)) active.push(order)
    else past.push(order)
  }
  return { active, past }
}
