'use server'

import { apiGet } from '@/lib/api/server'
import type { Shop } from '@/types'

export interface PublicShop {
  id: string
  slug: string
  name: string
  address: string | null
  currency: string
  locale: string
  lat: number | null
  lng: number | null
  brand_color: string
}

export async function getPublicShops(): Promise<PublicShop[]> {
  try {
    const data = await apiGet<{ shops: PublicShop[] }>('/public/shops', false)
    return data.shops ?? []
  } catch {
    return []
  }
}
