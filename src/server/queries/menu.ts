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
  const categoriesResponse = await apiGet<{ categories: MenuCategory[] }>(`/shops/${shopId}/menu_categories`)
  const itemsResponse = await apiGet<{ items: MenuItem[] }>(`/shops/${shopId}/menu_items`)
  const groupsResponse = await apiGet<{ modifier_groups: ModifierGroup[] }>(`/shops/${shopId}/modifier_groups`)

  const categories = categoriesResponse.categories ?? []
  const items = itemsResponse.items ?? []
  const groups = groupsResponse.modifier_groups ?? []

  const itemIds = items.map((i) => i.id)
  const groupIds = groups.map((g) => g.id)

  let itemModifierLinks: ItemModifierLink[] = []
  if (itemIds.length > 0 && groupIds.length > 0) {
    try {
      const linksResponse = await apiGet<{ item_modifier_links: ItemModifierLink[] }>(
        `/shops/${shopId}/item_modifier_links`
      )
      itemModifierLinks = linksResponse.item_modifier_links ?? []
    } catch {
      itemModifierLinks = []
    }
  }

  return {
    categories,
    items,
    modifierGroups: groups,
    modifierOptions: groups.flatMap((g) => g.options ?? []),
    itemModifierLinks,
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
