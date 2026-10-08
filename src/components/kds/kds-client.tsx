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

export function KdsClient({
  shopId,
  initialOrders,
  autoPoll = true,
}: {
  shopId: string
  initialOrders: Order[]
  autoPoll?: boolean
}) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders as OrderWithItems[])
  const [soundEnabled, setSoundEnabled] = useState(false)

  useEffect(() => {
    if (!autoPoll) return
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
  }, [shopId, soundEnabled, autoPoll])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage-500"></span>
          </span>
          Actualizacion en tiempo real cada 5 segundos
        </div>
        <Button
          variant={soundEnabled ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-full sm:w-auto"
        >
          <Icon name={soundEnabled ? 'volume-2' : 'volume-x'} className="mr-2 h-4 w-4" />
          Sonido {soundEnabled ? 'activado' : 'apagado'}
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-warm-300 bg-paper py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-100 text-warm-400">
            <Icon name="utensils" className="h-8 w-8" />
          </div>
          <p className="mt-5 font-serif text-xl font-semibold text-foreground">No hay pedidos activos</p>
          <p className="mt-1 text-sm text-muted-foreground">Los nuevos pedidos apareceran aqui automaticamente.</p>
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
