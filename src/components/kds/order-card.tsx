'use client'

import { updateOrderStatus } from '@/server/actions/kds'
import type { Order, OrderItem } from '@/types'

const statusLabels: Record<string, string> = {
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo',
  picked_up: 'Entregado',
  cancelled: 'Cancelado',
}

const nextActions: Record<string, { status: string; label: string } | null> = {
  received: { status: 'preparing', label: 'Preparar' },
  preparing: { status: 'ready', label: 'Listo' },
  ready: { status: 'picked_up', label: 'Entregado' },
  picked_up: null,
  cancelled: null,
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Pedido #{order.id.slice(0, 8)}</p>
          <p className="text-lg font-semibold text-zinc-900">{order.customer_name}</p>
          <p className="text-sm text-zinc-600">{order.customer_phone}</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800">
          {statusLabels[order.status]}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <span className="font-medium">{item.quantity}x {item.item_name_snapshot}</span>
            {item.modifiers && item.modifiers.length > 0 && (
              <span className="text-zinc-500"> ({item.modifiers.map((m) => m.option_name_snapshot).join(', ')})</span>
            )}
          </li>
        ))}
      </ul>

      {order.special_instructions && (
        <p className="mt-2 text-sm text-zinc-600">Nota: {order.special_instructions}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-900">
          Total: {order.currency ?? ''} {(order.total_cents / 100).toFixed(2)}
        </span>
        <div className="flex gap-2">
          {(order.status === 'received' || order.status === 'preparing') && (
            <button
              onClick={() => updateOrderStatus(shopId, order.id, 'cancelled')}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Cancelar
            </button>
          )}
          {action && (
            <button
              onClick={() => updateOrderStatus(shopId, order.id, action.status as any)}
              className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
