'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { Icon } from '@/components/ui/icon'
import { EMPTY_RECENT_SHOPS, getRecentSnapshot, subscribeRecentShops, type RecentShop } from '@/lib/recent-shops'
import { CUSTOMER_HOME_PATH } from '@/lib/site'

// Slug of the /demo shop (src/lib/demo-data.ts). It has no /<slug> route.
const DEMO_SHOP_SLUG = 'cafeteria-demo'

const hiddenPrefixes = ['/dashboard', '/auth', '/account/login', '/account/signup', '/checkout']
const hiddenPaths = ['/contacto', '/privacidad', '/terminos', '/aviso-legal', '/cookies']

/**
 * Customer "Inicio": the last storefront this phone visited, or /inicio.
 * Never the owner landing page at "/".
 */
export function customerHomeHref(recent: readonly RecentShop[]): string {
  const lastShop = recent.find((shop) => shop.slug && shop.slug !== DEMO_SHOP_SLUG)
  return lastShop ? `/${encodeURIComponent(lastShop.slug)}` : CUSTOMER_HOME_PATH
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
    { key: 'pedidos', href: '/account/orders', label: 'Pedidos', icon: 'receipt-euro' },
    { key: 'cuenta', href: '/account', label: 'Cuenta', icon: 'user' },
  ] as const

  const isActive = (key: (typeof navItems)[number]['key'], href: string) => {
    if (key === 'inicio') return pathname === homeHref || pathname === CUSTOMER_HOME_PATH
    if (key === 'cuenta') return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // 56 + safe area, bg at 94% with a 14px blur, hairline top border, no shadow (SPEC.md section 2).
  return (
    <nav className="customer-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/94 pb-[env(safe-area-inset-bottom)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-14 max-w-3xl items-stretch">
        {navItems.map((item) => {
          const active = isActive(item.key, item.href)
          return (
            <Link
              key={item.key}
              href={item.href}
              className={[
                'flex flex-1 flex-col items-center justify-center gap-[3px] text-tab transition-colors',
                active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground hover:text-foreground',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon name={item.icon} className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
