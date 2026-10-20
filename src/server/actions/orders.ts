'use server'

import { redirect } from 'next/navigation'
import { apiPost } from '@/lib/api/server'
import { z } from 'zod'

const cartItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  modifier_option_ids: z.array(z.string().uuid()).default([]),
})

const createOrderSchema = z.object({
  shop_id: z.string().uuid(),
  customer_name: z.string().min(1).max(100),
  customer_phone: z.string().max(30),
  pickup_type: z.enum(['asap', 'scheduled']).default('asap'),
  pickup_slot_date: z.string().optional(),
  pickup_slot_start_time: z.string().optional(),
  special_instructions: z.string().max(500).optional(),
  items: z.array(cartItemSchema).min(1),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

export async function createOrder(input: CreateOrderInput) {
  const parsed = createOrderSchema.parse(input)

  const orderBody: Record<string, unknown> = {
    customer_name: parsed.customer_name,
    customer_phone: parsed.customer_phone,
    pickup_type: parsed.pickup_type,
    special_instructions: parsed.special_instructions,
    items: parsed.items.map((item) => ({
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      modifier_option_ids: item.modifier_option_ids,
    })),
  }

  if (parsed.pickup_type === 'scheduled' && parsed.pickup_slot_date && parsed.pickup_slot_start_time) {
    orderBody.pickup_slot_date = parsed.pickup_slot_date
    orderBody.pickup_slot_start_time = parsed.pickup_slot_start_time
  }

  const data = await apiPost<{ order: { id: string; access_token: string } }>(
    `/shops/${parsed.shop_id}/orders`,
    { order: orderBody },
    false
  )

  redirect(`/checkout/${data.order.id}?token=${encodeURIComponent(data.order.access_token)}`)
}
