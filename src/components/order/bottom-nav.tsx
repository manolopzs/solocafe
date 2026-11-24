'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PhosphorIcon } from '@/components/icons/phosphor'
import { vibrate } from '@/lib/vibrate'
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
    { key: 'inicio', href: CUSTOMER_HOME_PATH, label: 'Home', icon: 'house' as const },
    { key: 'pedidos', href: '/account/orders', label: 'Orders', icon: 'receipt' as const },
    { key: 'cuenta', href: '/account', label: 'Account', icon: 'user' as const },
  ] as const

  const isActive = (key: (typeof navItems)[number]['key'], href: string) => {
    if (key === 'inicio') return pathname === CUSTOMER_HOME_PATH || isStorefrontPath(pathname)
    if (key === 'cuenta') return pathname === href
    // An order's live tracker belongs to Orders.
    if (key === 'pedidos' && pathname.startsWith('/order/')) return true
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="customer-bottom-nav fixed bottom-0 left-0 right-0 z-30 border-t border-foreground/10 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]">
      <div className="phone-col flex h-14 items-stretch">
        {navItems.map((item) => {
          const active = isActive(item.key, item.href)
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => vibrate(10)}
              className={[
                'flex flex-1 flex-col items-center justify-center gap-1 text-tab transition-transform duration-100 ease-out active:scale-[0.92] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <PhosphorIcon name={item.icon} weight={active ? 'fill' : 'regular'} className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
