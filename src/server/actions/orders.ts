'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const cartItemSchema = z.object({
  item_id: z.string().uuid(),
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
  const supabase = await createClient()
  const parsed = createOrderSchema.parse(input)

  const { data, error } = await supabase.rpc('create_order', {
    p_shop_id: parsed.shop_id,
    p_customer_name: parsed.customer_name,
    p_customer_phone: parsed.customer_phone,
    p_pickup_type: parsed.pickup_type,
    p_pickup_slot_id: parsed.pickup_slot_id ?? null,
    p_special_instructions: parsed.special_instructions ?? null,
    p_items: JSON.stringify(parsed.items),
  })

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create order')
  }

  redirect(`/checkout/${data}`)
}
