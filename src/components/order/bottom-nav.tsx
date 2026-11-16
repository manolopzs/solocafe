'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { Icon } from '@/components/ui/icon'
import { EMPTY_RECENT_SHOPS, getRecentSnapshot, subscribeRecentShops, type RecentShop } from '@/lib/recent-shops'

const EXPLORE_HREF = '/explore'
// Slug of the /demo shop (src/lib/demo-data.ts). It has no /<slug> route.
const DEMO_SHOP_SLUG = 'cafeteria-demo'

const hiddenPrefixes = ['/dashboard', '/auth', '/account/login', '/account/signup', '/checkout']
const hiddenPaths = ['/contacto', '/privacidad', '/terminos', '/aviso-legal', '/cookies']

/**
 * Customer "Inicio": the last storefront this phone visited, or Explorar.
 * Never the owner landing page at "/".
 */
export function customerHomeHref(recent: readonly RecentShop[]): string {
  const lastShop = recent.find((shop) => shop.slug && shop.slug !== DEMO_SHOP_SLUG)
  return lastShop ? `/${encodeURIComponent(lastShop.slug)}` : EXPLORE_HREF
}

export function BottomNav() {
  const pathname = usePathname()
  const recent = useSyncExternalStore(subscribeRecentShops, getRecentSnapshot, () => EMPTY_RECENT_SHOPS)
  const homeHref = customerHomeHref(recent)

  if (pathname === '/') return null
  if (hiddenPaths.includes(pathname)) return null
  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) return null

  const navItems = [
    { key: 'inicio', href: homeHref, label: 'Inicio', icon: 'store' },
    { key: 'explorar', href: EXPLORE_HREF, label: 'Explorar', icon: 'search' },
    { key: 'pedidos', href: '/account/orders', label: 'Pedidos', icon: 'receipt' },
    { key: 'cuenta', href: '/account', label: 'Cuenta', icon: 'user' },
  ] as const

  const isActive = (key: (typeof navItems)[number]['key'], href: string) => {
    // With no shop visited yet, Inicio is Explorar, so /explore lights Inicio (mock 02a).
    if (key === 'inicio') return pathname === homeHref
    if (key === 'explorar' && homeHref === EXPLORE_HREF) return false
    if (key === 'cuenta') return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="customer-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item.key, item.href)
          return (
            <Link
              key={item.key}
              href={item.href}
              className={[
                'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon name={item.icon as never} className={['h-5 w-5', active ? 'stroke-[2px]' : ''].join(' ')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
