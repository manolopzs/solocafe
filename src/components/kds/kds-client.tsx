'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
    const supabase = createClient()

    const fetchOrderItems = async (orderId: string) => {
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId)
      const itemIds = (items ?? []).map((i) => i.id)
      const { data: modifiers } = itemIds.length > 0
        ? await supabase.from('order_item_modifiers').select('*').in('order_item_id', itemIds)
        : { data: [] }
      const modsByItem = new Map<string, OrderItemModifier[]>()
      for (const m of (modifiers ?? []) as OrderItemModifier[]) {
        const list = modsByItem.get(m.order_item_id) ?? []
        list.push(m)
        modsByItem.set(m.order_item_id, list)
      }
      return (items ?? []).map((item) => ({
        ...item,
        modifiers: modsByItem.get(item.id) ?? [],
      }))
    }

    const channel = supabase
      .channel(`kds-${shopId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${shopId}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            const items = await fetchOrderItems(newOrder.id)
            setOrders((prev) => [{ ...newOrder, items }, ...prev])
            playBeep()
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Order
            const items = updated.status === 'picked_up' || updated.status === 'cancelled'
              ? []
              : await fetchOrderItems(updated.id)
            setOrders((prev) =>
              prev
                .map((o) => (o.id === updated.id ? { ...updated, items: items.length > 0 ? items : o.items } : o))
                .filter((o) => o.status !== 'picked_up' && o.status !== 'cancelled')
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
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
