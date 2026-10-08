'use server'

import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import type { Shop } from '@/types'

export async function getUserShops(): Promise<Shop[]> {
  try {
    const data = await apiGet<{ shops: Shop[] }>('/shops')
    return data.shops
  } catch {
    return []
  }
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  try {
    const data = await apiGet<{ shop: Shop }>(`/shops/${slug}`, false)
    return data.shop
  } catch {
    return null
  }
}

export async function getShopById(id: string): Promise<Shop | null> {
  try {
    const shops = await getUserShops()
    return shops.find((shop) => shop.id === id) ?? null
  } catch {
    return null
  }
}
