import { cacheLife, cacheTag } from 'next/cache'
import { publicGet } from '@/server/queries/public-get'
import type { FullMenu } from '@/server/queries/menu'
import type { ItemModifierLink, MenuCategory, MenuItem, ModifierGroup, ModifierOption, Shop } from '@/types'

interface StorefrontResponse {
  shop: Shop
  categories: MenuCategory[]
  items: MenuItem[]
  modifier_groups: ModifierGroup[]
  modifier_options: ModifierOption[]
  item_modifier_links: ItemModifierLink[]
}

export interface PublicStorefront {
  shop: Shop
  menu: FullMenu
}

export async function getPublicStorefront(slug: string): Promise<PublicStorefront | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag(`storefront:${slug}`)

  try {
    const data = await publicGet<StorefrontResponse>(`/public/storefront/${encodeURIComponent(slug)}`)
    return {
      shop: data.shop,
      menu: {
        categories: data.categories ?? [],
        items: data.items ?? [],
        modifierGroups: data.modifier_groups ?? [],
        modifierOptions: data.modifier_options ?? [],
        itemModifierLinks: data.item_modifier_links ?? [],
      },
    }
  } catch {
    return null
  }
}
