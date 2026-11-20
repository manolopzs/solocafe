'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { CUSTOMER_HOME_PATH } from '@/lib/site'

const hiddenPrefixes = ['/dashboard', '/auth', '/account/login', '/account/signup', '/checkout']
const hiddenPaths = ['/contacto', '/privacidad', '/terminos', '/aviso-legal', '/cookies']
const appSegments = new Set(['account', 'auth', 'checkout', 'dashboard', 'demo', 'explore', 'inicio', 'order'])

/** A shop menu lives at /<slug>: one segment that isn't another app route. */
export function isStorefrontPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length === 1 && !appSegments.has(segments[0]) && !hiddenPaths.includes(pathname)
}

/** Customer tabs: Home (/inicio, the shop list and Your usual), Orders and Account. */
export function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/') return null
  if (hiddenPaths.includes(pathname)) return null
  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) return null

  const navItems = [
    { key: 'inicio', href: CUSTOMER_HOME_PATH, label: 'Home', icon: 'store' },
    { key: 'pedidos', href: '/account/orders', label: 'Orders', icon: 'receipt-euro' },
    { key: 'cuenta', href: '/account', label: 'Account', icon: 'user' },
  ] as const

  const isActive = (key: (typeof navItems)[number]['key'], href: string) => {
    if (key === 'inicio') return pathname === CUSTOMER_HOME_PATH || isStorefrontPath(pathname)
    if (key === 'cuenta') return pathname === href
    // An order's live tracker belongs to Orders.
    if (key === 'pedidos' && pathname.startsWith('/order/')) return true
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
