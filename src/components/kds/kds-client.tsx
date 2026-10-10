'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api/client'
import { OrderCard } from './order-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import type { Order, OrderItem, OrderItemModifier } from '@/types'

interface OrderWithItems extends Order {
  items: (OrderItem & { modifiers: OrderItemModifier[] })[]
}

const columns: { status: OrderWithItems['status']; label: string }[] = [
  { status: 'received', label: 'Recibido' },
  { status: 'preparing', label: 'Preparando' },
  { status: 'ready', label: 'Listo' },
]

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

function formatTime(date: Date | null) {
  if (!date) return '--:--:--'
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function KdsClient({
  shopId,
  initialOrders,
  autoPoll = true,
  shopName,
}: {
  shopId: string
  initialOrders: Order[]
  autoPoll?: boolean
  shopName?: string
}) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders as OrderWithItems[])
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  useEffect(() => {
    setLastUpdated(new Date())
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // ignore fullscreen errors
    }
  }

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
        setLastUpdated(new Date())
      } catch {
        // ignore polling errors
      }
    }

    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [shopId, soundEnabled, autoPoll])

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Cocina {shopName ? `· ${shopName}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">
              Actualización automática cada 5 segundos
            </p>
          </div>
          <Badge variant="secondary" className="h-8 px-3 text-base">
            {orders.length} pedido{orders.length === 1 ? '' : 's'} activo
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Última actualización: {formatTime(lastUpdated)}
          </span>
          <Button
            variant={soundEnabled ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            <Icon name={soundEnabled ? 'volume-2' : 'volume-x'} className="mr-2 h-4 w-4" />
            {soundEnabled ? 'Sonido on' : 'Sonido off'}
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Icon name={isFullscreen ? 'minimize-2' : 'maximize-2'} className="mr-2 h-4 w-4" />
            {isFullscreen ? 'Salir' : 'Pantalla completa'}
          </Button>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface py-24 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-surface text-muted-foreground">
            <Icon name="utensils" className="h-14 w-14" />
          </div>
          <p className="mt-6 font-sans text-3xl font-bold text-foreground">No hay pedidos activos</p>
          <p className="mt-2 text-lg text-muted-foreground">
            Los nuevos pedidos aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((column) => {
            const columnOrders = orders.filter((o) => o.status === column.status)
            return (
              <section
                key={column.status}
                className="flex flex-col rounded-xl border border-border bg-surface p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="font-sans text-lg font-semibold text-foreground">{column.label}</h2>
                  <Badge variant="secondary" className="text-sm">
                    {columnOrders.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                  {columnOrders.map((order) => (
                    <OrderCard key={order.id} order={order} items={order.items} shopId={shopId} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
