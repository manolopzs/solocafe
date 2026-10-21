'use server'

import { redirect } from 'next/navigation'
import { apiPost } from '@/lib/api/server'
import type { CartPreview } from '@/types'
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
  customer_email: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().email().max(254).optional()
  ),
  pickup_type: z.enum(['asap', 'scheduled']).default('asap'),
  pickup_slot_date: z.string().optional(),
  pickup_slot_start_time: z.string().optional(),
  special_instructions: z.string().max(500).optional(),
  redeem_loyalty: z.boolean().optional(),
  items: z.array(cartItemSchema).min(1),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

export async function createOrder(input: CreateOrderInput) {
  const parsed = createOrderSchema.parse(input)

  const orderBody: Record<string, unknown> = {
    customer_name: parsed.customer_name,
    customer_phone: parsed.customer_phone,
    customer_email: parsed.customer_email,
    pickup_type: parsed.pickup_type,
    special_instructions: parsed.special_instructions,
    redeem_loyalty: parsed.redeem_loyalty === true,
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
    { order: orderBody }
  )

  redirect(`/checkout/${data.order.id}?token=${encodeURIComponent(data.order.access_token)}`)
}

export async function previewPublicCart(input: {
  shopId: string
  pickupType: 'asap' | 'scheduled'
  redeemLoyalty: boolean
  items: { menu_item_id: string; quantity: number; modifier_option_ids: string[] }[]
}): Promise<CartPreview> {
  return apiPost<CartPreview>(`/public/shops/${input.shopId}/cart/preview`, {
    pickup_type: input.pickupType,
    redeem_loyalty: input.redeemLoyalty,
    items: input.items,
  })
}
