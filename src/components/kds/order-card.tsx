'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import type { Order, OrderItem } from '@/types'

const statusLabels: Record<string, string> = {
  pending_payment: 'Pendiente de pago',
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

const actionLabels: Record<string, string> = {
  preparing: 'Preparar',
  ready: 'Listo',
  picked_up: 'Entregado',
  cancelled: 'Cancelar',
}

function useNow(interval = 1000) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    const kick = window.setTimeout(() => setNow(Date.now()), 0)
    const id = window.setInterval(() => setNow(Date.now()), interval)
    return () => {
      window.clearTimeout(kick)
      window.clearInterval(id)
    }
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
  onUpdated,
}: {
  order: Order
  items: (OrderItem & { modifiers?: { option_name_snapshot: string; price_cents: number }[] })[]
  shopId: string
  onUpdated: (order: Order) => void
}) {
  const now = useNow()
  const elapsedMinutes = getElapsedMinutes(order.created_at, now)
  const transitions = order.allowed_transitions ?? []
  const primary = transitions.find((status) => status !== 'cancelled')
  const canCancel = transitions.includes('cancelled')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const advance = async (nextStatus: string) => {
    setIsPending(true)
    setError(null)
    try {
      const data = await api.patch<{ order: Order }>(`/shops/${shopId}/orders/${order.id}`, {
        order: { status: nextStatus },
      })
      onUpdated(data.order)
    } catch {
      setError('No se pudo actualizar el pedido.')
    } finally {
      setIsPending(false)
    }
  }

  const urgencyClass =
    elapsedMinutes > 10
      ? '!bg-danger/10 !border-danger/30 border-l-danger'
      : elapsedMinutes > 5
        ? '!bg-warning/10 !border-warning/30 border-l-warning'
        : 'border-l-border'

  return (
    <Card variant="outline" className={`flex flex-col overflow-hidden border-l-8 ${urgencyClass}`}>
      <div className="flex items-start justify-between border-b border-border bg-surface-elevated px-3 py-3 sm:px-4">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-5xl font-bold leading-none text-foreground md:text-6xl">
            #{shortOrderNumber(order.id)}
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground md:text-2xl">
            {order.customer_name || 'Cliente'}
          </p>
          {order.customer_phone && (
            <p className="text-sm text-muted-foreground sm:text-base">{order.customer_phone}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 pl-3">
          <Badge variant={statusVariants[order.status] ?? 'secondary'} className="px-4 py-1.5 text-base md:text-lg">
            {statusLabels[order.status]}
          </Badge>
          <div className="flex items-center gap-1 text-xl font-semibold text-muted-foreground md:text-2xl">
            <Icon name="clock" className="h-4 w-4 sm:h-5 sm:w-5" />
            {formatElapsed(order.created_at, now)}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-surface-elevated p-3 sm:p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-surface p-2.5 sm:p-3">
              <span className="text-xl font-bold text-foreground md:text-2xl">
                {item.quantity}x {item.item_name_snapshot}
              </span>
              {item.modifiers && item.modifiers.length > 0 && (
                <p className="mt-1 text-base text-muted-foreground md:text-xl">
                  {item.modifiers.map((m) => m.option_name_snapshot).join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>

        {order.special_instructions && (
          <div className="mt-3 flex gap-2 rounded-lg border border-border bg-surface p-3 text-base text-foreground md:text-xl">
            <Icon name="message-circle" className="mt-0.5 h-4 w-4 shrink-0 text-accent sm:h-5 sm:w-5" />
            {order.special_instructions}
          </div>
        )}

        <p className="mt-4 text-lg font-semibold text-foreground md:text-xl">
          Total: {order.currency ?? ''} {(order.total_cents / 100).toFixed(2)}
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-surface-elevated p-4">
        {primary && (
          <Button
            variant="primary"
            size="lg"
            className="min-h-16 w-full text-xl font-bold touch-manipulation md:text-2xl"
            loading={isPending}
            onClick={() => void advance(primary)}
          >
            {actionLabels[primary] ?? primary}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            size="lg"
            className="min-h-14 w-full text-lg text-danger hover:bg-danger/10 touch-manipulation"
            disabled={isPending}
            onClick={() => void advance('cancelled')}
          >
            Cancelar
          </Button>
        )}
        {error && <p className="text-center text-base font-semibold text-danger">{error}</p>}
      </div>
    </Card>
  )
}
