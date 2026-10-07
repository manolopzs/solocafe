import { createClient } from '@/lib/supabase/server'
import type { Order, OrderItem, OrderItemModifier } from '@/types'

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Order
}

export async function getOrderWithItems(id: string): Promise<(Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }) | null> {
  const supabase = await createClient()
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  const itemIds = (items ?? []).map((i) => i.id)
  const { data: modifiers } = itemIds.length > 0
    ? await supabase.from('order_item_modifiers').select('*').in('order_item_id', itemIds)
    : { data: [] }

  const modifiersByItem = new Map<string, OrderItemModifier[]>()
  for (const m of (modifiers ?? []) as OrderItemModifier[]) {
    const list = modifiersByItem.get(m.order_item_id) ?? []
    list.push(m)
    modifiersByItem.set(m.order_item_id, list)
  }

  return {
    ...order,
    items: (items ?? []).map((item) => ({
      ...item,
      modifiers: modifiersByItem.get(item.id) ?? [],
    })) as (OrderItem & { modifiers: OrderItemModifier[] })[],
  } as Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }
}

export async function getShopOrders(shopId: string, status?: string): Promise<Order[]> {
  const supabase = await createClient()
  let query = supabase.from('orders').select('*').eq('shop_id', shopId)
  if (status) {
    query = query.eq('status', status)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return []
  return data as Order[]
}
