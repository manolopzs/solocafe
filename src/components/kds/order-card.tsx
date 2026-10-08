'use client'

import { updateOrderStatus } from '@/server/actions/kds'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
    <Card variant="outline" className="flex flex-col">
      <CardContent className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">{order.customer_name || 'Cliente'}</p>
            {order.customer_phone && <p className="text-sm text-muted-foreground">{order.customer_phone}</p>}
          </div>
          <Badge variant={statusVariants[order.status] ?? 'secondary'}>{statusLabels[order.status]}</Badge>
        </div>

        <p className="mt-3 text-xs font-medium text-amber-700">
          {formatElapsed(order.created_at)}
        </p>

        <ul className="mt-4 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg bg-warm-50 px-3 py-2">
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
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Nota: {order.special_instructions}
          </p>
        )}

        <p className="mt-4 text-base font-bold text-foreground">
          Total: {order.currency ?? ''} {(order.total_cents / 100).toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 border-t border-warm-100 p-4 pt-4">
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
          <Button className="flex-1" onClick={() => updateOrderStatus(shopId, order.id, action.status as any)}>
            {action.label}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
