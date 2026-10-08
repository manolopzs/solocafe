import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublicShops } from '@/server/queries/explore'
import { isStage2Enabled } from '@/lib/features'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export const instant = false

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string }>
}) {
  if (!isStage2Enabled()) notFound()

  const { lat, lng } = await searchParams
  const userLat = lat ? parseFloat(lat) : null
  const userLng = lng ? parseFloat(lng) : null

  const shops = await getPublicShops()

  const sortedShops = shops
    .map((shop) => {
      const distanceKm =
        userLat && userLng && shop.lat && shop.lng
          ? haversineDistance(userLat, userLng, shop.lat, shop.lng)
          : null
      return { ...shop, distanceKm }
    })
    .sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm
      if (a.distanceKm != null) return -1
      if (b.distanceKm != null) return 1
      return a.name.localeCompare(b.name)
    })

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-warm-200 bg-paper/80 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-sm">
              <Icon name="coffee" className="h-5 w-5" />
            </div>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">Solo Cafe</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="px-5 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Descubre cafeterias cerca de ti
          </h1>
          <p className="mt-4 text-muted-foreground">
            Ordena para recoger en cafeterias independientes. Sin apps de terceros.
          </p>
        </div>
      </section>

      <section className="px-5">
        <div className="mx-auto max-w-4xl">
          {sortedShops.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-warm-300 bg-paper py-16 text-center">
              <Icon name="store" className="mx-auto h-12 w-12 text-warm-300" />
              <p className="mt-4 text-lg font-medium text-foreground">Aun no hay cafeterias en la red</p>
              <p className="text-sm text-muted-foreground">Vuelve pronto para descubrir nuevas opciones.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedShops.map((shop) => (
                <Link key={shop.id} href={`/${shop.slug}`}>
                  <Card variant="outline" className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                        style={{ backgroundColor: shop.brand_color || '#c45d3a' }}
                      >
                        <Icon name="coffee" className="h-7 w-7" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="font-serif text-lg font-semibold text-foreground">{shop.name}</h2>
                          {shop.distanceKm != null && (
                            <span className="shrink-0 text-sm font-medium text-terracotta-600">
                              {shop.distanceKm < 1
                                ? `${Math.round(shop.distanceKm * 1000)} m`
                                : `${shop.distanceKm.toFixed(1)} km`}
                            </span>
                          )}
                        </div>
                        {shop.address && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <Icon name="map-pin" className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{shop.address}</span>
                          </p>
                        )}
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-800">
                          <span className="inline-flex h-2 w-2 rounded-full bg-sage-500" />
                          Abierto · Para recoger
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
