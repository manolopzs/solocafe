import { createClient } from '@/lib/supabase/server'
import type { MenuCategory, MenuItem, ModifierGroup, ModifierOption, ItemModifierLink } from '@/types'

export interface FullMenu {
  categories: MenuCategory[]
  items: MenuItem[]
  modifierGroups: ModifierGroup[]
  modifierOptions: ModifierOption[]
  itemModifierLinks: ItemModifierLink[]
}

export async function getFullMenu(shopId: string): Promise<FullMenu> {
  const supabase = await createClient()

  const [{ data: categories }, { data: items }, { data: modifierGroups }] = await Promise.all([
    supabase.from('menu_categories').select('*').eq('shop_id', shopId).order('sort_order'),
    supabase.from('menu_items').select('*').eq('shop_id', shopId).order('sort_order'),
    supabase.from('modifier_groups').select('*').eq('shop_id', shopId).order('sort_order'),
  ])

  const groupIds = (modifierGroups ?? []).map((g) => g.id)
  const itemIds = (items ?? []).map((i) => i.id)

  const [{ data: modifierOptions }, { data: itemModifierLinks }] = await Promise.all([
    groupIds.length > 0
      ? supabase.from('modifier_options').select('*').in('group_id', groupIds).order('sort_order')
      : Promise.resolve({ data: [] }),
    itemIds.length > 0
      ? supabase.from('item_modifier_links').select('*').in('item_id', itemIds)
      : Promise.resolve({ data: [] }),
  ])

  return {
    categories: (categories ?? []) as MenuCategory[],
    items: (items ?? []) as MenuItem[],
    modifierGroups: (modifierGroups ?? []) as ModifierGroup[],
    modifierOptions: (modifierOptions ?? []) as ModifierOption[],
    itemModifierLinks: (itemModifierLinks ?? []) as ItemModifierLink[],
  }
}

export async function getPublicMenu(shopId: string): Promise<FullMenu> {
  const supabase = await createClient()

  const [{ data: categories }, { data: items }, { data: modifierGroups }] = await Promise.all([
    supabase.from('menu_categories').select('*').eq('shop_id', shopId).eq('is_active', true).order('sort_order'),
    supabase.from('menu_items').select('*').eq('shop_id', shopId).eq('is_active', true).eq('is_86ed', false).order('sort_order'),
    supabase.from('modifier_groups').select('*').eq('shop_id', shopId).order('sort_order'),
  ])

  const groupIds = (modifierGroups ?? []).map((g) => g.id)
  const itemIds = (items ?? []).map((i) => i.id)

  const [{ data: modifierOptions }, { data: itemModifierLinks }] = await Promise.all([
    groupIds.length > 0
      ? supabase.from('modifier_options').select('*').in('group_id', groupIds).eq('is_active', true).order('sort_order')
      : Promise.resolve({ data: [] }),
    itemIds.length > 0
      ? supabase.from('item_modifier_links').select('*').in('item_id', itemIds)
      : Promise.resolve({ data: [] }),
  ])

  return {
    categories: (categories ?? []) as MenuCategory[],
    items: (items ?? []) as MenuItem[],
    modifierGroups: (modifierGroups ?? []) as ModifierGroup[],
    modifierOptions: (modifierOptions ?? []) as ModifierOption[],
    itemModifierLinks: (itemModifierLinks ?? []) as ItemModifierLink[],
  }
}
