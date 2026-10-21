import Image from 'next/image'
import Link from 'next/link'
import { displayFontFamily } from '@/lib/display-fonts'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import type { PublicShop } from '@/server/queries/explore'

function formatDistance(km: number) {
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`
  return `${km.toFixed(km < 10 ? 1 : 0)} km`
}

export function ShopDirectory({
  shops,
  sort,
}: {
  shops: PublicShop[]
  sort: 'name' | 'distance'
}) {
  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 bg-background/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon name="coffee" className="h-5 w-5" />
            </span>
            <span className="truncate text-lg font-medium tracking-tight text-foreground">Solo Cafe</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/account/login">Entrar</Link>
          </Button>
        </div>
      </header>

      <section className="px-4 pb-6 pt-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[2rem] font-medium leading-tight tracking-tight text-foreground">Cafeterías para recoger</h1>
          <p className="mt-2 max-w-md text-base leading-6 text-muted-foreground">
            {sort === 'distance'
              ? 'Ordenadas de la más cercana a la más lejana.'
              : 'Elige una cafetería independiente. Activa la ubicación para ver primero las más cercanas.'}
          </p>
        </div>
      </section>

      <section className="px-4">
        <div className="mx-auto max-w-3xl">
          {shops.length === 0 ? (
            <EmptyState
              icon={<Icon name="store" className="h-6 w-6" />}
              title="Aún no hay cafeterías en la red"
              description="Vuelve pronto para descubrir nuevas opciones."
            />
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {shops.map((shop) => (
                <li key={shop.slug}>
                  <Link
                    href={`/${shop.slug}`}
                    className="group block overflow-hidden rounded-3xl bg-surface-elevated shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-surface">
                      {shop.hero_photo_url ? (
                        <Image
                          src={shop.hero_photo_url}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 384px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white" style={{ backgroundColor: shop.brand_color }}>
                          <Icon name="coffee" className="h-12 w-12 opacity-90" />
                        </div>
                      )}
                      <span
                        className={[
                          'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-xs font-medium backdrop-blur-sm',
                          shop.open_now ? 'text-success' : 'text-muted-foreground',
                        ].join(' ')}
                      >
                        <span className={['h-1.5 w-1.5 rounded-full', shop.open_now ? 'bg-success' : 'bg-muted-foreground'].join(' ')} />
                        {shop.open_now ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                    <div className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <h2
                          className="min-w-0 truncate text-xl font-medium tracking-tight text-foreground"
                          style={{ fontFamily: displayFontFamily(shop.display_font) }}
                        >
                          {shop.name}
                        </h2>
                        {sort === 'distance' && shop.distance_km != null && (
                          <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                            {formatDistance(shop.distance_km)}
                          </span>
                        )}
                      </div>
                      {shop.address && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Icon name="map-pin" className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{shop.address}</span>
                        </p>
                      )}
                      <p className="mt-3 text-sm text-muted-foreground">Para recoger</p>
                    </div>
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
