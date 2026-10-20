'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { Sheet } from '@/components/ui/sheet'
import {
  EMPTY_RECENT_SHOPS,
  getRecentSnapshot,
  rememberShop,
  subscribeRecentShops,
  type RecentShop,
} from '@/lib/recent-shops'

export function ShopSwitcher({ shop }: { shop: RecentShop }) {
  const [open, setOpen] = useState(false)
  const recent = useSyncExternalStore(subscribeRecentShops, getRecentSnapshot, () => EMPTY_RECENT_SHOPS)
  const others = recent.filter((item) => item.slug !== shop.slug)

  useEffect(() => {
    rememberShop({ slug: shop.slug, name: shop.name })
  }, [shop.slug, shop.name])

  return (
    <>
      <button
        type="button"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface"
        aria-label="Cambiar cafetería"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="chevron-down" className="h-5 w-5" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} position="bottom" title="Cambiar cafetería">
        <nav className="flex flex-col gap-2 pb-2" aria-label="Otras cafeterías">
          <div className="rounded-2xl bg-surface px-4 py-3">
            <p className="text-xs text-muted-foreground">Estás en</p>
            <p className="shop-display-font mt-0.5 truncate text-lg font-medium text-foreground">{shop.name}</p>
          </div>
          <Link
            href="/explore"
            onClick={() => setOpen(false)}
            className="flex min-h-14 items-center gap-3 rounded-2xl px-3 text-base font-medium text-foreground hover:bg-surface"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="search" className="h-5 w-5" />
            </span>
            Ver todas las cafeterías
          </Link>
          <p className="px-3 pt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recientes</p>
          {others.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Aún no has visitado otras cafeterías.</p>
          ) : (
            others.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center gap-3 rounded-2xl px-3 text-base font-medium text-foreground hover:bg-surface"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted-foreground">
                  <Icon name="store" className="h-5 w-5" />
                </span>
                <span className="truncate">{item.name}</span>
              </Link>
            ))
          )}
        </nav>
      </Sheet>
    </>
  )
}
