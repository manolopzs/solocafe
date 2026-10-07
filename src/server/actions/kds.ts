'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types'

export const stateMachine: Record<OrderStatus, OrderStatus[]> = {
  received: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked_up'],
  picked_up: [],
  cancelled: [],
}

export async function updateOrderStatus(shopId: string, orderId: string, nextStatus: OrderStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('shop_members')
    .select('id')
    .eq('shop_id', shopId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) throw new Error('Unauthorized')

  const { data: order } = await supabase
    .from('orders')
    .select('status, customer_phone, customer_name')
    .eq('id', orderId)
    .eq('shop_id', shopId)
    .single()

  if (!order) throw new Error('Order not found')

  const current = order.status as OrderStatus
  if (!stateMachine[current]?.includes(nextStatus)) {
    throw new Error(`Invalid transition from ${current} to ${nextStatus}`)
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId)

  if (error) throw new Error(error.message)

  await supabase.from('events').insert({
    shop_id: shopId,
    order_id: orderId,
    type: `order_${nextStatus}`,
    payload: { previous_status: current },
  })

  if (nextStatus === 'ready' && order.customer_phone) {
    await supabase.from('notifications').insert({
      shop_id: shopId,
      order_id: orderId,
      type: 'ready',
      channel: 'sms',
      status: 'pending',
    })
  }

  revalidatePath(`/dashboard/${shopId}/kds`)
}
