'use server'

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import type { MenuCategory, MenuItem, ModifierGroup, ModifierOption, ItemModifierLink } from '@/types'

export interface FullMenu {
  categories: MenuCategory[]
  items: MenuItem[]
  modifierGroups: ModifierGroup[]
  modifierOptions: ModifierOption[]
  itemModifierLinks: ItemModifierLink[]
}

export async function getFullMenu(shopId: string): Promise<FullMenu> {
  const data = await apiGet<{
    categories: MenuCategory[]
    items: MenuItem[]
    modifier_groups: ModifierGroup[]
    modifier_options: ModifierOption[]
    item_modifier_links: ItemModifierLink[]
  }>(`/shops/${shopId}/menu_categories`)

  const categories = data.categories ?? []
  const itemsResponse = await apiGet<{ items: MenuItem[] }>(`/shops/${shopId}/menu_items`)
  const groupsResponse = await apiGet<{ modifier_groups: ModifierGroup[] }>(`/shops/${shopId}/modifier_groups`)

  const groups = groupsResponse.modifier_groups ?? []
  const groupIds = groups.map((g) => g.id)
  const itemIds = (itemsResponse.items ?? []).map((i) => i.id)

  return {
    categories,
    items: itemsResponse.items ?? [],
    modifierGroups: groups,
    modifierOptions: groups.flatMap((g) => g.options ?? []),
    itemModifierLinks: [],
  }
}

export async function getPublicMenu(shopId: string): Promise<FullMenu> {
  const data = await apiGet<{
    categories: MenuCategory[]
    items: MenuItem[]
    modifier_groups: ModifierGroup[]
    modifier_options: ModifierOption[]
    item_modifier_links: ItemModifierLink[]
  }>(`/public/shops/${shopId}/menu`, false)

  return {
    categories: data.categories ?? [],
    items: data.items ?? [],
    modifierGroups: data.modifier_groups ?? [],
    modifierOptions: data.modifier_options ?? [],
    itemModifierLinks: data.item_modifier_links ?? [],
  }
}
