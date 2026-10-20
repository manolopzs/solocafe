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
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-elevated"
        aria-label="Cambiar cafetería"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="chevron-down" className="h-5 w-5" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} position="bottom" title="Cambiar cafetería">
        <nav className="flex flex-col gap-1 pb-2" aria-label="Otras cafeterías">
          <Link
            href="/explore"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-surface"
          >
            <Icon name="search" className="h-5 w-5 text-accent" />
            Ver todas las cafeterías
          </Link>
          <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recientes</p>
          {others.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Aún no has visitado otras cafeterías.</p>
          ) : (
            others.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-surface"
              >
                <Icon name="store" className="h-5 w-5 text-muted-foreground" />
                <span className="truncate">{item.name}</span>
              </Link>
            ))
          )}
        </nav>
      </Sheet>
    </>
  )
}
