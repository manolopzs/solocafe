'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError } from '@/lib/api/client'
import { toggleItem86 } from '@/server/actions/menu'
import { OrderCard } from './order-card'
import { KdsAlerts } from './kds-alerts'
import { KdsSync, type KdsAlert, type KdsSyncPolicy } from './kds-sync'
import { listKdsMutations, removeKdsMutation } from './kds-offline-queue'
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

const openStatuses = new Set(['received', 'preparing', 'ready'])

function formatTime(date: Date | null) {
  if (!date) return 'sin hora'
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
  initialSync = null,
}: {
  shopId: string
  initialOrders: Order[]
  initialMenuItems: MenuItem[]
  initialCategories?: MenuCategory[]
  autoPoll?: boolean
  shopName?: string
  initialSync?: KdsSyncPolicy | null
}) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders as OrderWithItems[])
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories)
  const [menuPanelOpen, setMenuPanelOpen] = useState(false)
  const [pending86, setPending86] = useState<Set<string>>(new Set())
  const [alertsEnabled, setAlertsEnabled] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mobileColumn, setMobileColumn] = useState<OrderWithItems['status']>('received')
  const [link, setLink] = useState<'online' | 'offline' | 'retrying'>('online')
  const [retryInMs, setRetryInMs] = useState<number | null>(null)
  const [usingCachedOrders, setUsingCachedOrders] = useState(false)
  const alertsRef = useRef(false)
  const syncRef = useRef<KdsSyncPolicy | null>(initialSync)
  const drainQueueRef = useRef<() => Promise<void>>(async () => {})

  const applyOrderUpdate = (updated: Order) => {
    setOrders((prev) => {
      if (!openStatuses.has(updated.status)) {
        return prev.filter((order) => order.id !== updated.id)
      }
      const withItems = updated as OrderWithItems
      if (!prev.some((order) => order.id === updated.id)) return [withItems, ...prev]
      return prev.map((order) => (order.id === updated.id ? { ...order, ...withItems, items: withItems.items ?? order.items } : order))
    })
  }

  const drainQueue = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return
    const mutations = (await listKdsMutations()).filter((m) => m.shopId === shopId)
    for (const mutation of mutations) {
      try {
        const data = await api.patch<{ order: Order }>(`/shops/${mutation.shopId}/orders/${mutation.orderId}`, {
          order: { status: mutation.status },
        })
        await removeKdsMutation(mutation.clientMutationId)
        applyOrderUpdate(data.order)
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          await removeKdsMutation(mutation.clientMutationId)
          continue
        }
        // Preserve FIFO for dependent status changes on the same order.
        break
      }
    }
  }, [shopId])

  useEffect(() => {
    drainQueueRef.current = drainQueue
  }, [drainQueue])

  const syncOrdersToSW = useCallback((payload: { orders: Order[]; sync: KdsSyncPolicy; alerts: KdsAlert[] }) => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ type: 'KDS_ORDERS_SYNC', payload, shopId })
        }
      })
      .catch(() => {})
  }, [shopId])

  const loadCachedOrders = async (): Promise<{ orders: Order[]; sync: KdsSyncPolicy } | null> => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
    const registration = await navigator.serviceWorker.ready
    if (!registration.active) return null
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.data?.type === 'KDS_CACHED_ORDERS') {
          navigator.serviceWorker.removeEventListener('message', listener)
          resolve(event.data.payload as { orders: Order[]; sync: KdsSyncPolicy })
        }
      }
      navigator.serviceWorker.addEventListener('message', listener)
      registration.active?.postMessage({ type: 'KDS_GET_CACHED_ORDERS' })
      window.setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', listener)
        resolve(null)
      }, 1000)
    })
  }

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => setLastUpdated(new Date()), 0)
    return () => window.clearTimeout(id)
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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/kds-sw.js').catch(() => {})
    }

    const goOffline = () => setLink('offline')
    const goOnline = () => {
      setLink((current) => (current === 'offline' ? 'online' : current))
      void drainQueueRef.current()
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    const id = window.setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setLink('offline')
      } else {
        void drainQueueRef.current()
      }
    }, 0)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  useEffect(() => {
    if (!autoPoll) return
    let cancelled = false
    let attempt = 0
    let timer = 0
    let cursor = initialSync?.server_time ?? null
    let primed = cursor !== null

    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        void tick()
      }, delay)
    }

    const tick = async () => {
      if (cancelled) return
      const delays = syncRef.current?.retry_delays_ms ?? KdsSync.fallbackDelaysMs
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setLink('offline')
        const delay = KdsSync.delayMs(attempt, delays)
        setRetryInMs(delay)
        attempt += 1
        schedule(delay)
        return
      }

      try {
        const query = new URLSearchParams({ view: 'kitchen' })
        if (cursor) query.set('since', cursor)
        const data = await api.get<{
          orders: OrderWithItems[]
          sync: KdsSyncPolicy
          alerts: KdsAlert[]
        }>(`/shops/${shopId}/orders?${query.toString()}`)
        if (cancelled) return
        syncRef.current = data.sync
        setOrders(data.orders ?? [])
        setLastUpdated(new Date())
        setLink('online')
        setRetryInMs(null)
        attempt = 0
        if (primed && alertsRef.current && (data.alerts?.length ?? 0) > 0) {
          KdsAlerts.play()
          KdsAlerts.notify(data.alerts.length)
        }
        primed = true
        cursor = data.sync.server_time
        setUsingCachedOrders(false)
        syncOrdersToSW(data)
        schedule(data.sync.poll_interval_ms || KdsSync.fallbackPollMs)
      } catch {
        if (cancelled) return
        const offline = typeof navigator !== 'undefined' && navigator.onLine === false
        setLink(offline ? 'offline' : 'retrying')
        if (offline) {
          const cached = await loadCachedOrders()
          if (cached && cached.orders.length > 0) {
            setOrders(cached.orders as OrderWithItems[])
            setUsingCachedOrders(true)
            if (cached.sync?.server_time) {
              syncRef.current = cached.sync
              cursor = cached.sync.server_time
            }
          }
        }
        const delay = KdsSync.delayMs(attempt, delays)
        setRetryInMs(delay)
        attempt += 1
        schedule(delay)
      }
    }

    schedule(syncRef.current?.poll_interval_ms ?? KdsSync.fallbackPollMs)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [shopId, autoPoll, initialSync?.server_time, syncOrdersToSW])

  const toggleAlerts = async () => {
    const next = !alertsRef.current
    alertsRef.current = next
    setAlertsEnabled(next)
    if (!next) return
    await KdsAlerts.enable()
    try {
      await KdsAlerts.register(shopId, syncRef.current?.vapid_public_key ?? null)
    } catch {
      // Sound and the on-screen notice still work if the device could not be stored.
    }
  }

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
          <Badge variant="secondary" className="h-10 px-3 text-base">
            {orders.length === 1 ? '1 pedido activo' : `${orders.length} pedidos activos`}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base text-muted-foreground">
            Última actualización: {formatTime(lastUpdated)}
          </span>
          <Button variant="outline" onClick={() => setMenuPanelOpen(true)}>
            <Icon name="menu" className="mr-2 h-5 w-5" />
            Menú rápido
          </Button>
          <Button
            variant={alertsEnabled ? 'primary' : 'outline'}
            onClick={() => void toggleAlerts()}
          >
            <Icon name={alertsEnabled ? 'volume-2' : 'volume-x'} className="mr-2 h-5 w-5" />
            {alertsEnabled ? 'Avisos activos' : 'Avisos apagados'}
          </Button>
          <Button variant="outline" onClick={toggleFullscreen}>
            <Icon name={isFullscreen ? 'minimize-2' : 'maximize-2'} className="mr-2 h-5 w-5" />
            {isFullscreen ? 'Salir' : 'Pantalla completa'}
          </Button>
        </div>
      </header>

      {link !== 'online' && (
        <div
          role="status"
          data-testid="kds-connection"
          className="rounded-xl border border-terracotta-300 bg-terracotta-50 px-4 py-4 text-base font-semibold text-terracotta-900 md:px-5 md:text-lg"
        >
          {link === 'offline'
            ? 'Sin conexión. Los pedidos en pantalla siguen visibles.'
            : `Sin respuesta del servidor. Siguiente intento en ${Math.max(1, Math.ceil((retryInMs ?? 1000) / 1000))} s.`}
        </div>
      )}

      {usingCachedOrders && (
        <div
          role="status"
          data-testid="kds-cached-banner"
          className="rounded-xl border border-warning bg-warning/10 px-4 py-4 text-base font-semibold text-warning-foreground md:px-5 md:text-lg"
        >
          Sin conexión. Mostrando últimos pedidos guardados.
        </div>
      )}

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
                    'flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-base font-semibold transition-colors touch-manipulation',
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

          <div className="hidden flex-1 flex-col gap-4 md:flex lg:grid lg:grid-cols-3">
            {columns.map((column) => {
              const columnOrders = orders.filter((o) => o.status === column.status)
              return (
                <section
                  key={column.status}
                  className="flex flex-col rounded-xl border border-border bg-surface p-4"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="font-sans text-xl font-semibold text-foreground md:text-2xl">{column.label}</h2>
                    <Badge variant="secondary" className="text-base">
                      {columnOrders.length}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                    {columnOrders.map((order) => (
                      <OrderCard key={order.id} order={order} items={order.items} shopId={shopId} onUpdated={applyOrderUpdate} />
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
                    <h2 className="font-sans text-xl font-semibold text-foreground">{column.label}</h2>
                    <Badge variant="secondary" className="text-sm">
                      {columnOrders.length}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
                    {columnOrders.map((order) => (
                      <OrderCard key={order.id} order={order} items={order.items} shopId={shopId} onUpdated={applyOrderUpdate} />
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
        title="Menú rápido"
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
