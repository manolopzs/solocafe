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
  pickup_slot_id: z.string().uuid().optional(),
  special_instructions: z.string().max(500).optional(),
  items: z.array(cartItemSchema).min(1),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

export async function createOrder(input: CreateOrderInput) {
  const parsed = createOrderSchema.parse(input)

  const data = await apiPost<{ order: { id: string } }>(
    `/shops/${parsed.shop_id}/orders`,
    {
      order: {
        customer_name: parsed.customer_name,
        customer_phone: parsed.customer_phone,
        pickup_type: parsed.pickup_type,
        special_instructions: parsed.special_instructions,
        items: parsed.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          modifier_option_ids: item.modifier_option_ids,
        })),
      },
    },
    false
  )

  redirect(`/checkout/${data.order.id}?phone=${encodeURIComponent(parsed.customer_phone)}`)
}
