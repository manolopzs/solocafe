import { cacheLife, cacheTag } from 'next/cache'
import { publicGet } from '@/server/queries/public-get'
import { getPublicStorefront } from '@/server/queries/storefront'
import { shopCutouts } from '@/lib/storefront-menu'

export interface PublicShop {
  name: string
  slug: string
  address: string | null
  open_now: boolean
  hours_configured?: boolean
  brand_color: string | null
  display_font: string
  hero_photo_url: string | null
  distance_km?: number | null
}

export interface PublicDirectory {
  sort: 'name' | 'distance'
  shops: PublicShop[]
}

export async function getPublicShops(
  origin?: { lat: number; lng: number },
  { includeClosed = false }: { includeClosed?: boolean } = {},
): Promise<PublicDirectory> {
  'use cache'
  cacheLife('minutes')
  cacheTag(origin ? 'explore:near' : includeClosed ? 'explore:all' : 'explore:directory')

  const params = new URLSearchParams()
  if (origin) {
    params.set('lat', String(origin.lat))
    params.set('lng', String(origin.lng))
  }
  if (includeClosed) params.set('include_closed', 'true')
  const query = params.toString()

  try {
    const data = await publicGet<PublicDirectory>(`/public/shops${query ? `?${query}` : ''}`)
    return {
      sort: data.sort === 'distance' ? 'distance' : 'name',
      shops: data.shops ?? [],
    }
  } catch {
    return { sort: 'name', shops: [] }
  }
}

/**
 * Inicio's shop cards use cut-outs from each shop's own menu when it has no photo.
 * Reads the cached storefronts; a shop whose menu can't be read just gets none.
 */
export async function withMenuCutouts(shops: PublicShop[]): Promise<(PublicShop & { cutouts: string[] })[]> {
  return Promise.all(
    shops.map(async (shop) => {
      if (shop.hero_photo_url) return { ...shop, cutouts: [] }
      const storefront = await getPublicStorefront(shop.slug)
      return { ...shop, cutouts: storefront ? shopCutouts(storefront.menu.items) : [] }
    }),
  )
}
