'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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

async function isMember(shopId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('shop_members')
    .select('id')
    .eq('shop_id', shopId)
    .eq('user_id', user.id)
    .maybeSingle()
  return !!data
}

export async function createCategory(shopId: string, input: unknown) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const parsed = categorySchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('menu_categories').insert({ shop_id: shopId, ...parsed })
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function updateCategory(shopId: string, id: string, input: unknown) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const parsed = categorySchema.partial().parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('menu_categories').update(parsed).eq('id', id).eq('shop_id', shopId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function deleteCategory(shopId: string, id: string) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const supabase = await createClient()
  const { error } = await supabase.from('menu_categories').delete().eq('id', id).eq('shop_id', shopId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function createItem(shopId: string, input: unknown) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const parsed = itemSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('menu_items').insert({
    shop_id: shopId,
    ...parsed,
    description: parsed.description ?? null,
    category_id: parsed.category_id ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function updateItem(shopId: string, id: string, input: unknown) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const parsed = itemSchema.partial().parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('menu_items').update(parsed).eq('id', id).eq('shop_id', shopId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function deleteItem(shopId: string, id: string) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const supabase = await createClient()
  const { error } = await supabase.from('menu_items').delete().eq('id', id).eq('shop_id', shopId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function createModifierGroup(shopId: string, input: unknown) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const parsed = modifierGroupSchema.parse(input)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modifier_groups')
    .insert({ shop_id: shopId, ...parsed })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create modifier group')
  revalidatePath(`/dashboard/${shopId}/menu`)
  return data.id
}

export async function updateModifierGroup(shopId: string, id: string, input: unknown) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const parsed = modifierGroupSchema.partial().parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('modifier_groups').update(parsed).eq('id', id).eq('shop_id', shopId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function deleteModifierGroup(shopId: string, id: string) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const supabase = await createClient()
  const { error } = await supabase.from('modifier_groups').delete().eq('id', id).eq('shop_id', shopId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function createModifierOption(shopId: string, groupId: string, input: unknown) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const parsed = modifierOptionSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('modifier_options').insert({ group_id: groupId, ...parsed })
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function updateModifierOption(shopId: string, id: string, input: unknown) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const parsed = modifierOptionSchema.partial().parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('modifier_options').update(parsed).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function deleteModifierOption(shopId: string, id: string) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const supabase = await createClient()
  const { error } = await supabase.from('modifier_options').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function attachModifierGroup(shopId: string, itemId: string, groupId: string, isRequired: boolean) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const supabase = await createClient()
  const { error } = await supabase.from('item_modifier_links').insert({
    item_id: itemId,
    group_id: groupId,
    is_required: isRequired,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function detachModifierGroup(shopId: string, linkId: string) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const supabase = await createClient()
  const { error } = await supabase.from('item_modifier_links').delete().eq('id', linkId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}

export async function toggleItem86(shopId: string, id: string, is86ed: boolean) {
  if (!(await isMember(shopId))) throw new Error('Unauthorized')
  const supabase = await createClient()
  const { error } = await supabase.from('menu_items').update({ is_86ed: is86ed }).eq('id', id).eq('shop_id', shopId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${shopId}/menu`)
}
