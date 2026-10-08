'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api/client'
import { OrderCard } from './order-card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
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
  const [soundEnabled, setSoundEnabled] = useState(false)

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

        if (hasNewOrder && soundEnabled) {
          playBeep()
        }

        setOrders(activeOrders)
      } catch {
        // ignore polling errors
      }
    }

    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [shopId, soundEnabled])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">Actualizacion en tiempo real cada 5 segundos.</p>
        <Button
          variant={soundEnabled ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-full sm:w-auto"
        >
          <Icon name={soundEnabled ? 'check' : 'x'} className="mr-2 h-4 w-4" />
          Sonido {soundEnabled ? 'activado' : 'apagado'}
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-warm-300 bg-paper py-16 text-center">
          <Icon name="utensils" className="h-12 w-12 text-warm-300" />
          <p className="mt-4 text-lg font-medium text-foreground">No hay pedidos activos</p>
          <p className="text-sm text-muted-foreground">Los nuevos pedidos apareceran aqui.</p>
        </div>
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
