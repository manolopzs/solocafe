import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { hoursConfigured } from '@/lib/ordering'
import { Icon } from '@/components/ui/icon'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import type { PublicShop } from '@/server/queries/explore'

/** A shop on Inicio, with up to three cut-outs from its own menu for the card art. */
export type DirectoryShop = PublicShop & { cutouts?: string[] }

function formatDistance(km: number) {
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`
  return `${km.toFixed(km < 10 ? 1 : 0)} km`
}

function shopCountLabel(count: number) {
  return count === 1 ? '1 cafetería' : `${count} cafeterías`
}

/**
 * Inicio (mock 01): greeting, then "Cafeterías" with one card per shop. Each card
 * leads to the shop's menu at /<slug>. With a single shop, a block explains that
 * more will come instead of leaving the screen empty.
 */
export function ShopDirectory({
  shops,
  sort,
  title,
  headerAction,
  children,
}: {
  shops: DirectoryShop[]
  sort: 'name' | 'distance'
  /** H1, e.g. the greeting for the time of day. */
  title: string
  /** Top-right of the header. Defaults to "Entrar". */
  headerAction?: ReactNode
  /** Shown between the subtitle and "Cafeterías" (e.g. Lo de siempre). */
  children?: ReactNode
}) {
  return (
    <main className="pb-tabs min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5">
        <header className="flex h-14 items-center justify-between">
          <Link href="/inicio" className="flex min-h-11 items-center" aria-label="Solo Café, inicio">
            <SoloCafeWordmark height={24} />
          </Link>
          {headerAction ?? (
            <Link href="/account/login" className="flex min-h-11 items-center px-1 text-body-sm font-semibold text-foreground">
              Entrar
            </Link>
          )}
        </header>

        <h1 className="mt-4 text-h1 text-heading">{title}</h1>
        <p className="mt-2 text-body text-muted-foreground">Pide desde aquí y recoge sin cola.</p>
        {sort === 'distance' && (
          <p className="mt-1 text-body-sm text-muted-foreground">Ordenadas de la más cercana a la más lejana.</p>
        )}

        {children}

        <section className="mt-8" aria-labelledby="cafeterias">
          <div className="flex items-baseline justify-between">
            <h2 id="cafeterias" className="text-h2 text-heading">Cafeterías</h2>
            {shops.length > 0 && <span className="text-caption text-muted-foreground">{shopCountLabel(shops.length)}</span>}
          </div>

          {shops.length === 0 ? (
            <ComingSoon className="mt-6" title="Aún no hay cafeterías en la red" text="Vuelve pronto para descubrir nuevas opciones." />
          ) : (
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {shops.map((shop) => (
                <li key={shop.slug}>
                  <ShopCard shop={shop} showDistance={sort === 'distance'} />
                </li>
              ))}
            </ul>
          )}

          {shops.length === 1 && (
            <ComingSoon
              className="mt-8"
              title="Pronto, más cafeterías"
              text="Cuando se unan cafeterías cerca de ti, aparecerán aquí."
            />
          )}
        </section>
      </div>
    </main>
  )
}

function ShopCard({ shop, showDistance }: { shop: DirectoryShop; showDistance: boolean }) {
  return (
    <Link
      href={`/${encodeURIComponent(shop.slug)}`}
      className="group block overflow-hidden rounded-card border border-border bg-surface-elevated shadow-card"
    >
      <ShopArt shop={shop} />
      <div className="px-5 pb-5 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[20px] font-semibold leading-[26px] tracking-[-0.01em] text-foreground">{shop.name}</h3>
            {shop.address && (
              <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                <Icon name="map-pin" className="h-4 w-4 shrink-0" />
                <span className="truncate">{shop.address}</span>
              </p>
            )}
          </div>
          <span className="mt-1 inline-flex h-9 shrink-0 items-center rounded-full bg-pill px-4 text-body-sm font-semibold text-on-pill">
            Ver carta
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 items-center rounded-full bg-pill px-3 text-[13px] font-semibold leading-4 text-on-pill">
            Para recoger
          </span>
          {hoursConfigured(shop) && (
            <span
              className={[
                'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold leading-4',
                shop.open_now ? 'bg-[#e3eee6] text-success' : 'bg-pill text-on-pill',
              ].join(' ')}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {shop.open_now ? 'Abierto' : 'Cerrado'}
            </span>
          )}
          {showDistance && shop.distance_km != null && (
            <span className="ml-auto text-body-sm font-medium tabular-nums text-foreground">{formatDistance(shop.distance_km)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

/** 184px of art on surface with a 40px curve: the shop photo, or cut-outs from its menu, or a coffee icon. */
function ShopArt({ shop }: { shop: DirectoryShop }) {
  const cutouts = shop.cutouts ?? []
  return (
    <div className="relative h-[184px] overflow-hidden bg-surface" data-testid="shop-art">
      {shop.hero_photo_url ? (
        <Image src={shop.hero_photo_url} alt="" fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover" />
      ) : cutouts.length === 0 ? (
        <div className="flex h-full items-center justify-center pb-6 text-muted-foreground">
          <Icon name="coffee" className="h-7 w-7" />
        </div>
      ) : (
        <CutoutTrio cutouts={cutouts} />
      )}
      <svg
        className="absolute inset-x-0 -bottom-px h-10 w-full"
        viewBox="0 0 350 40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 40V22Q175 -14 350 22V40Z" className="fill-surface-elevated" />
      </svg>
    </div>
  )
}

function CutoutTrio({ cutouts }: { cutouts: string[] }) {
  const [first, second, third] = cutouts
  // Centre cup largest (164) and in front; side cups 132, as in mock 01.
  return (
    <div className="absolute inset-0 mx-auto max-w-[350px]" aria-hidden="true">
      {second && (
        <Image src={second} alt="" width={132} height={132} className="absolute left-[6%] top-[30px] h-[132px] w-[132px]" />
      )}
      {third && (
        <Image src={third} alt="" width={132} height={132} className="absolute right-[6%] top-[34px] h-[132px] w-[132px]" />
      )}
      <Image
        src={first}
        alt=""
        width={164}
        height={164}
        priority
        className="absolute left-1/2 top-2 z-[1] h-[164px] w-[164px] -translate-x-1/2"
      />
    </div>
  )
}

function ComingSoon({ title, text, className = '' }: { title: string; text: string; className?: string }) {
  return (
    <div className={['flex gap-4 rounded-card bg-surface px-5 py-6', className].join(' ')}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-foreground">
        <Icon name="store" className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold leading-[22px] text-foreground">{title}</p>
        <p className="mt-1 text-body-sm text-muted-foreground">{text}</p>
        <Link
          href="/"
          className="mt-3 inline-flex min-h-11 items-center text-body-sm font-semibold text-foreground underline underline-offset-[3px]"
        >
          ¿Tienes una cafetería? Únete
        </Link>
      </div>
    </div>
  )
}
