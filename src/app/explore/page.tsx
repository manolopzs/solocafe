import { ShopDirectory } from '@/components/explore/shop-directory'
import { ExploreGeolocation } from '@/components/explore/explore-geolocation'
import { getPublicShops } from '@/server/queries/explore'

export const instant = false

function originFromParams(lat?: string, lng?: string) {
  if (!lat || !lng) return undefined
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return undefined
  return { lat: latitude, lng: longitude }
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string }>
}) {
  const { lat, lng } = await searchParams
  const origin = originFromParams(lat, lng)
  const { shops, sort } = await getPublicShops(origin)

  return (
    <>
      <ExploreGeolocation hasOrigin={origin != null} />
      <ShopDirectory shops={shops} sort={sort} />
    </>
  )
}
