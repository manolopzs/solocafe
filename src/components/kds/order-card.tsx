'use client'

import { useEffect, useState } from 'react'
import { updateOrderStatus } from '@/server/actions/kds'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import type { Order, OrderItem } from '@/types'

const statusLabels: Record<string, string> = {
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo',
  picked_up: 'Entregado',
  cancelled: 'Cancelado',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'danger'> = {
  received: 'secondary',
  preparing: 'warning',
  ready: 'success',
  picked_up: 'default',
  cancelled: 'danger',
}

const nextActions: Record<string, { status: string; label: string } | null> = {
  received: { status: 'preparing', label: 'Preparar' },
  preparing: { status: 'ready', label: 'Listo' },
  ready: { status: 'picked_up', label: 'Entregado' },
  picked_up: null,
  cancelled: null,
}

function useNow(interval = 1000) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

function getElapsedMinutes(createdAt: string, now: number) {
  if (!now) return 0
  return Math.floor((now - new Date(createdAt).getTime()) / 60000)
}

function formatElapsed(createdAt: string, now: number) {
  if (!now) return '0:00'
  const diffMs = now - new Date(createdAt).getTime()
  if (diffMs < 0) return '0:00'
  const totalSeconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes < 60) return `${minutes}:${seconds.toString().padStart(2, '0')}`
  const hours = Math.floor(minutes / 60)
  return `${hours}:${(minutes % 60).toString().padStart(2, '0')}`
}

function shortOrderNumber(id: string) {
  const tail = id.split('-').pop() ?? id
  const display = tail.length > 6 ? tail.slice(-4) : tail
  return display.toUpperCase()
}

export function OrderCard({
  order,
  items,
  shopId,
}: {
  order: Order
  items: (OrderItem & { modifiers?: { option_name_snapshot: string; price_cents: number }[] })[]
  shopId: string
}) {
  const now = useNow()
  const elapsedMinutes = getElapsedMinutes(order.created_at, now)
  const action = nextActions[order.status]

  const urgencyClass =
    elapsedMinutes > 10
      ? '!bg-danger/10 !border-danger/30 border-l-danger'
      : elapsedMinutes > 5
        ? '!bg-warning/10 !border-warning/30 border-l-warning'
        : 'border-l-border'

  return (
    <Card variant="outline" className={`flex flex-col overflow-hidden border-l-8 ${urgencyClass}`}>
      <div className="flex items-start justify-between border-b border-border bg-surface-elevated px-4 py-3">
        <div>
          <p className="font-sans text-5xl font-bold leading-none text-foreground">
            #{shortOrderNumber(order.id)}
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {order.customer_name || 'Cliente'}
          </p>
          {order.customer_phone && (
            <p className="text-base text-muted-foreground">{order.customer_phone}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={statusVariants[order.status] ?? 'secondary'} className="text-sm">
            {statusLabels[order.status]}
          </Badge>
          <div className="flex items-center gap-1 text-xl font-semibold text-muted-foreground">
            <Icon name="clock" className="h-5 w-5" />
            {formatElapsed(order.created_at, now)}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-surface-elevated p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-surface p-3">
              <span className="text-xl font-bold text-foreground">
                {item.quantity}x {item.item_name_snapshot}
              </span>
              {item.modifiers && item.modifiers.length > 0 && (
                <p className="mt-1 text-lg text-muted-foreground">
                  {item.modifiers.map((m) => m.option_name_snapshot).join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>

        {order.special_instructions && (
          <div className="mt-3 flex gap-2 rounded-lg border border-border bg-surface p-3 text-lg text-foreground">
            <Icon name="message-circle" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            {order.special_instructions}
          </div>
        )}

        <p className="mt-4 text-lg font-semibold text-foreground">
          Total: {order.currency ?? ''} {(order.total_cents / 100).toFixed(2)}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-border bg-surface-elevated p-4">
        {action && (
          <Button
            variant="primary"
            size="lg"
            className="h-16 w-full text-2xl font-bold"
            onClick={() => updateOrderStatus(shopId, order.id, action.status as any)}
          >
            {action.label}
          </Button>
        )}
        {(order.status === 'received' || order.status === 'preparing') && (
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full text-lg text-danger hover:bg-danger/10"
            onClick={() => updateOrderStatus(shopId, order.id, 'cancelled')}
          >
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  )
}
