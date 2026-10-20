'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api/client'
import { toggleItem86 } from '@/server/actions/menu'
import { OrderCard } from './order-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Sheet } from '@/components/ui/sheet'
import type { Order, OrderItem, OrderItemModifier, MenuItem, MenuCategory } from '@/types'

interface OrderWithItems extends Order {
  items: (OrderItem & { modifiers: OrderItemModifier[] })[]
}

const columns: { status: OrderWithItems['status']; label: string }[] = [
  { status: 'received', label: 'Recibido' },
  { status: 'preparing', label: 'Preparando' },
  { status: 'ready', label: 'Listo' },
]

function isKitchenOrder(order: { status: string; payment_status: string }) {
  if (order.status === 'pending_payment' || order.status === 'picked_up' || order.status === 'cancelled') {
    return false
  }

  return order.payment_status === 'succeeded' || order.payment_status === 'refunded'
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
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
  initialMenuItems,
  initialCategories = [],
  autoPoll = true,
  shopName,
}: {
  shopId: string
  initialOrders: Order[]
  initialMenuItems: MenuItem[]
  initialCategories?: MenuCategory[]
  autoPoll?: boolean
  shopName?: string
}) {
  const [orders, setOrders] = useState<OrderWithItems[]>(
    (initialOrders as OrderWithItems[]).filter(isKitchenOrder)
  )
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories)
  const [menuPanelOpen, setMenuPanelOpen] = useState(false)
  const [pending86, setPending86] = useState<Set<string>>(new Set())
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mobileColumn, setMobileColumn] = useState<OrderWithItems['status']>('received')

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
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
    if (!menuPanelOpen) return
    if (categories.length > 0) return

    api.get<{ categories: MenuCategory[] }>(`/shops/${shopId}/menu_categories`)
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {})
  }, [menuPanelOpen, categories.length, shopId])

  const handleToggle86 = async (id: string, current: boolean) => {
    const next = !current
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_86ed: next } : item)))
    setPending86((prev) => new Set(prev).add(id))
    try {
      await toggleItem86(shopId, id, next)
    } catch {
      setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_86ed: current } : item)))
    } finally {
      setPending86((prev) => {
        const nextSet = new Set(prev)
        nextSet.delete(id)
        return nextSet
      })
    }
  }

  const groupedMenu = (() => {
    const byCategory = new Map<string | null, MenuItem[]>()
    for (const item of menuItems) {
      const key = item.category_id
      const list = byCategory.get(key) ?? []
      list.push(item)
      byCategory.set(key, list)
    }

    const ordered: { key: string | null; name: string; items: MenuItem[] }[] = []
    for (const category of [...categories].sort((a, b) => a.sort_order - b.sort_order)) {
      const items = byCategory.get(category.id)
      if (items) ordered.push({ key: category.id, name: category.name, items })
    }
    const uncategorized = byCategory.get(null)
    if (uncategorized) ordered.push({ key: null, name: 'Otros', items: uncategorized })

    for (const [key, items] of byCategory) {
      if (key !== null && !ordered.some((g) => g.key === key)) {
        ordered.push({ key, name: 'Categoria', items })
      }
    }

    return ordered
  })()

  useEffect(() => {
    if (!autoPoll) return
    let previousIds = new Set(orders.map((o) => o.id))

    const fetchOrders = async () => {
      try {
        const data = await api.get<{ orders: OrderWithItems[] }>(`/shops/${shopId}/orders`)
        const activeOrders = (data.orders ?? []).filter(isKitchenOrder)

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

    void fetchOrders()
    const interval = setInterval(() => void fetchOrders(), 5000)
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
              Prepara, marca como listo y notifica al cliente.
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
          <Button variant="outline" size="sm" onClick={() => setMenuPanelOpen(true)}>
            <Icon name="menu" className="mr-2 h-4 w-4" />
            Menu rapido
          </Button>
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
        <>
          <div className="flex gap-2 md:hidden">
            {columns.map((column) => {
              const count = orders.filter((o) => o.status === column.status).length
              return (
                <button
                  key={column.status}
                  onClick={() => setMobileColumn(column.status)}
                  className={[
                    'flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors touch-manipulation',
                    mobileColumn === column.status
                      ? 'border-foreground bg-foreground text-primary-foreground'
                      : 'border-border bg-surface text-foreground hover:bg-secondary',
                  ].join(' ')}
                >
                  {column.label}
                  <Badge variant={mobileColumn === column.status ? 'secondary' : 'default'} className="text-xs">
                    {count}
                  </Badge>
                </button>
              )
            })}
          </div>

          <div className="hidden flex-1 grid-cols-3 gap-4 md:grid">
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

          <div className="flex flex-1 flex-col md:hidden">
            {(() => {
              const column = columns.find((c) => c.status === mobileColumn) ?? columns[0]
              const columnOrders = orders.filter((o) => o.status === column.status)
              return (
                <section className="flex flex-1 flex-col rounded-xl border border-border bg-surface p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="font-sans text-lg font-semibold text-foreground">{column.label}</h2>
                    <Badge variant="secondary" className="text-sm">
                      {columnOrders.length}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
                    {columnOrders.map((order) => (
                      <OrderCard key={order.id} order={order} items={order.items} shopId={shopId} />
                    ))}
                  </div>
                </section>
              )
            })()}
          </div>
        </>
      )}

      <Sheet
        open={menuPanelOpen}
        onClose={() => setMenuPanelOpen(false)}
        title="Menu rapido"
        position="right"
      >
        <div className="space-y-6">
          {groupedMenu.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay productos configurados.</p>
          ) : (
            groupedMenu.map((group) => (
              <div key={group.key ?? 'uncategorized'}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {group.name}
                </h3>
                <ul className="mt-3 space-y-2">
                  {group.items
                    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
                    .map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.is_86ed ? 'Agotado' : 'Disponible'}
                          </p>
                        </div>
                        <Button
                          variant={item.is_86ed ? 'destructive' : 'outline'}
                          size="sm"
                          disabled={pending86.has(item.id)}
                          onClick={() => handleToggle86(item.id, item.is_86ed)}
                        >
                          {item.is_86ed ? 'Agotado' : 'Activo'}
                        </Button>
                      </li>
                    ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </Sheet>
    </div>
  )
}
