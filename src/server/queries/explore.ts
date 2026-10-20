'use server'

import { apiGet } from '@/lib/api/server'

export interface PublicShop {
  name: string
  slug: string
  address: string | null
  open_now: boolean
  brand_color: string
  display_font: string
  hero_photo_url: string | null
  distance_km?: number | null
}

export interface PublicDirectory {
  sort: 'name' | 'distance'
  shops: PublicShop[]
}

export async function getPublicShops(origin?: { lat: number; lng: number }): Promise<PublicDirectory> {
  const params = new URLSearchParams()
  if (origin) {
    params.set('lat', String(origin.lat))
    params.set('lng', String(origin.lng))
  }
  const query = params.toString()

  try {
    const data = await apiGet<PublicDirectory>(`/public/shops${query ? `?${query}` : ''}`, false)
    return {
      sort: data.sort === 'distance' ? 'distance' : 'name',
      shops: data.shops ?? [],
    }
  } catch {
    return { sort: 'name', shops: [] }
  }
}
