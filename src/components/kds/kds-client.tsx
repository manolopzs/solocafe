'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api/client'
import { OrderCard } from './order-card'
import type { Order, OrderItem, OrderItemModifier } from '@/types'

interface OrderWithItems extends Order {
  items: (OrderItem & { modifiers: OrderItemModifier[] })[]
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    osc.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  } catch {
    // ignore audio errors
  }
}

export function KdsClient({ shopId, initialOrders }: { shopId: string; initialOrders: Order[] }) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders as OrderWithItems[])

  useEffect(() => {
    let previousIds = new Set(orders.map((o) => o.id))

    const fetchOrders = async () => {
      try {
        const data = await api.get<{ orders: OrderWithItems[] }>(`/shops/${shopId}/orders`)
        const activeOrders = (data.orders ?? []).filter(
          (o) => o.status !== 'picked_up' && o.status !== 'cancelled'
        )

        const currentIds = new Set(activeOrders.map((o) => o.id))
        const hasNewOrder = activeOrders.some((o) => !previousIds.has(o.id))
        previousIds = currentIds

        if (hasNewOrder) {
          playBeep()
        }

        setOrders(activeOrders)
      } catch {
        // ignore polling errors
      }
    }

    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [shopId])

  return (
    <div>
      {orders.length === 0 ? (
        <p className="text-zinc-500">No hay pedidos activos.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} items={order.items} shopId={shopId} />
          ))}
        </div>
      )}
    </div>
  )
}
