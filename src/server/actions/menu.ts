'use server'

import { revalidatePath } from 'next/cache'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  sort_order: z.number().int().default(0),
})

const itemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price_cents: z.number().int().min(0),
  category_id: z.string().uuid().optional(),
  image_url: z.string().url().max(1000).optional().or(z.literal('')),
  prep_time_min: z.number().int().min(1).default(5),
  sort_order: z.number().int().default(0),
})

const modifierGroupSchema = z.object({
  name: z.string().min(1).max(100),
  min_select: z.number().int().min(0).default(0),
  max_select: z.number().int().min(1).default(1),
})

const modifierOptionSchema = z.object({
  name: z.string().min(1).max(100),
  price_cents: z.number().int().min(0).default(0),
})

export async function createCategory(shopId: string, input: unknown) {
  const parsed = categorySchema.parse(input)
  await apiPost(`/shops/${shopId}/menu_categories`, { menu_category: parsed })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function updateCategory(shopId: string, id: string, input: unknown) {
  const parsed = categorySchema.partial().parse(input)
  await apiPatch(`/shops/${shopId}/menu_categories/${id}`, { menu_category: parsed })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function deleteCategory(shopId: string, id: string) {
  await apiDelete(`/shops/${shopId}/menu_categories/${id}`)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function createItem(shopId: string, input: unknown) {
  const parsed = itemSchema.parse(input)
  await apiPost(`/shops/${shopId}/menu_items`, { menu_item: parsed })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function updateItem(shopId: string, id: string, input: unknown) {
  const parsed = itemSchema.partial().parse(input)
  await apiPatch(`/shops/${shopId}/menu_items/${id}`, { menu_item: parsed })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function deleteItem(shopId: string, id: string) {
  await apiDelete(`/shops/${shopId}/menu_items/${id}`)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function createModifierGroup(shopId: string, input: unknown) {
  const parsed = modifierGroupSchema.parse(input)
  const data = await apiPost<{ modifier_group: { id: string } }>(
    `/shops/${shopId}/modifier_groups`,
    { modifier_group: parsed }
  )
  revalidatePath(`/dashboard/${shopId}/menu`)
  return data.modifier_group.id
}

export async function updateModifierGroup(shopId: string, id: string, input: unknown) {
  const parsed = modifierGroupSchema.partial().parse(input)
  await apiPatch(`/shops/${shopId}/modifier_groups/${id}`, { modifier_group: parsed })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function deleteModifierGroup(shopId: string, id: string) {
  await apiDelete(`/shops/${shopId}/modifier_groups/${id}`)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function createModifierOption(shopId: string, groupId: string, input: unknown) {
  const parsed = modifierOptionSchema.parse(input)
  await apiPost(`/shops/${shopId}/modifier_groups/${groupId}/modifier_options`, {
    modifier_option: parsed,
  })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function updateModifierOption(shopId: string, groupId: string, id: string, input: unknown) {
  const parsed = modifierOptionSchema.partial().parse(input)
  await apiPatch(`/shops/${shopId}/modifier_groups/${groupId}/modifier_options/${id}`, {
    modifier_option: parsed,
  })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function deleteModifierOption(shopId: string, groupId: string, id: string) {
  await apiDelete(`/shops/${shopId}/modifier_groups/${groupId}/modifier_options/${id}`)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function toggleItem86(shopId: string, id: string, is86ed: boolean) {
  await apiPatch(`/shops/${shopId}/menu_items/${id}`, { menu_item: { is_86ed: is86ed } })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function linkModifierGroup(shopId: string, itemId: string, groupId: string, isRequired = false) {
  await apiPost(`/shops/${shopId}/item_modifier_links`, {
    item_id: itemId,
    group_id: groupId,
    is_required: isRequired,
  })
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function unlinkModifierGroup(shopId: string, linkId: string) {
  await apiDelete(`/shops/${shopId}/item_modifier_links/${linkId}`)
  revalidatePath(`/dashboard/${shopId}/menu`)
}
