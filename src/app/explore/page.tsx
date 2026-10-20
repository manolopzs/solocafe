import Link from 'next/link'
import { getPublicShops } from '@/server/queries/explore'
import { displayFontFamily } from '@/lib/display-fonts'
import { ExploreGeolocation } from '@/components/explore/explore-geolocation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export const instant = false

function originFromParams(lat?: string, lng?: string) {
  if (!lat || !lng) return undefined
  const latitude = Number(lat)
  const longitude = Number(lng)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return undefined
  return { lat: latitude, lng: longitude }
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`
  return `${km.toFixed(km < 10 ? 1 : 0)} km`
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
    <main className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Icon name="coffee" className="h-5 w-5" />
            </div>
            <span className="truncate text-lg font-semibold tracking-tight text-foreground">Solo Cafe</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="px-4 pt-8 pb-6">
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Cafeterías para recoger</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {sort === 'distance'
              ? 'Ordenadas de la más cercana a la más lejana.'
              : 'Elige una cafetería independiente. Activa la ubicación para ver primero las más cercanas.'}
          </p>
          <ExploreGeolocation hasOrigin={origin != null} />
        </div>
      </section>

      <section className="px-4">
        <div className="mx-auto max-w-lg">
          {shops.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-14 text-center">
              <Icon name="store" className="mx-auto h-12 w-12 text-subtle" />
              <p className="mt-4 text-lg font-medium text-foreground">Aún no hay cafeterías en la red</p>
              <p className="mt-1 text-sm text-muted-foreground">Vuelve pronto para descubrir nuevas opciones.</p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {shops.map((shop) => (
                <li key={shop.slug}>
                  <Link href={`/${shop.slug}`} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Card variant="outline" className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-start gap-3 p-4">
                        {shop.hero_photo_url ? (
                          <div
                            aria-hidden
                            className="h-14 w-14 shrink-0 rounded-2xl bg-cover bg-center"
                            style={{ backgroundImage: `url("${shop.hero_photo_url.replaceAll('"', '')}")` }}
                          />
                        ) : (
                          <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                            style={{ backgroundColor: shop.brand_color }}
                          >
                            <Icon name="coffee" className="h-7 w-7" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h2
                              className="truncate text-lg font-semibold text-foreground"
                              style={{ fontFamily: displayFontFamily(shop.display_font) }}
                            >
                              {shop.name}
                            </h2>
                            {sort === 'distance' && shop.distance_km != null && (
                              <span className="shrink-0 text-sm font-medium text-accent">
                                {formatDistance(shop.distance_km)}
                              </span>
                            )}
                          </div>
                          {shop.address && (
                            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <Icon name="map-pin" className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{shop.address}</span>
                            </p>
                          )}
                          <div
                            className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                              shop.open_now ? 'bg-success/10 text-success' : 'bg-subtle text-muted-foreground'
                            }`}
                          >
                            <span
                              className={`inline-flex h-2 w-2 rounded-full ${shop.open_now ? 'bg-success' : 'bg-muted-foreground'}`}
                            />
                            {shop.open_now ? 'Abierto' : 'Cerrado'} · Para recoger
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
