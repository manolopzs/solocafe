'use client'

import { updateOrderStatus } from '@/server/actions/kds'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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

const nextActions: Record<string, { status: string; label: string; variant: 'primary' | 'outline' } | null> = {
  received: { status: 'preparing', label: 'Empezar', variant: 'primary' },
  preparing: { status: 'ready', label: 'Listo', variant: 'primary' },
  ready: { status: 'picked_up', label: 'Entregado', variant: 'outline' },
  picked_up: null,
  cancelled: null,
}

function formatElapsed(createdAt: string) {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (diff < 1) return 'Ahora'
  if (diff < 60) return `${diff} min`
  const hours = Math.floor(diff / 60)
  return `${hours} h ${diff % 60} min`
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
  const action = nextActions[order.status]

  return (
    <Card variant="outline" className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-warm-100 bg-cream px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-semibold text-foreground">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{formatElapsed(order.created_at)}</span>
        </div>
        <Badge variant={statusVariants[order.status] ?? 'secondary'}>{statusLabels[order.status]}</Badge>
      </div>

      <CardContent className="flex-1 p-5">
        <div className="mb-4">
          <p className="text-lg font-bold text-foreground">{order.customer_name || 'Cliente'}</p>
          {order.customer_phone && <p className="text-sm text-muted-foreground">{order.customer_phone}</p>}
        </div>

        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-warm-100 bg-cream px-3 py-2.5">
              <span className="font-semibold text-foreground">
                {item.quantity}x {item.item_name_snapshot}
              </span>
              {item.modifiers && item.modifiers.length > 0 && (
                <p className="mt-0.5 text-muted-foreground">
                  {item.modifiers.map((m) => m.option_name_snapshot).join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>

        {order.special_instructions && (
          <div className="mt-3 flex gap-2 rounded-xl bg-terracotta-50 px-3 py-2.5 text-sm text-terracotta-900">
            <Icon name="message-circle" className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-600" />
            {order.special_instructions}
          </div>
        )}

        <p className="mt-4 text-base font-bold text-foreground">
          Total: {order.currency ?? ''} {(order.total_cents / 100).toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 border-t border-warm-100 bg-cream p-4">
        {(order.status === 'received' || order.status === 'preparing') && (
          <Button
            variant="outline"
            className="flex-1 text-danger hover:bg-red-50 hover:text-red-700"
            onClick={() => updateOrderStatus(shopId, order.id, 'cancelled')}
          >
            Cancelar
          </Button>
        )}
        {action && (
          <Button
            variant={action.variant}
            className="flex-1"
            onClick={() => updateOrderStatus(shopId, order.id, action.status as any)}
          >
            {action.label}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
