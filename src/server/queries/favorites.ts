'use server'

import { apiGet, apiPost, apiDelete } from '@/lib/api/server'

export async function getShopFavorites(shopId: string): Promise<string[]> {
  try {
    const data = await apiGet<{ favorites: { menu_item_id: string }[] }>(`/shops/${shopId}/favorites`)
    return (data.favorites ?? []).map((f) => f.menu_item_id)
  } catch {
    return []
  }
}

export async function addFavorite(shopId: string, menuItemId: string) {
  await apiPost(`/shops/${shopId}/favorites`, { menu_item_id: menuItemId })
}

export async function removeFavorite(shopId: string, menuItemId: string) {
  await apiDelete(`/shops/${shopId}/favorites/${menuItemId}`)
}
