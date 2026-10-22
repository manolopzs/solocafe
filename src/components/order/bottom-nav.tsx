'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/icon'

const navItems = [
  { href: '/', label: 'Inicio', icon: 'store' },
  { href: '/explore', label: 'Explorar', icon: 'search' },
  { href: '/account/orders', label: 'Pedidos', icon: 'receipt' },
  { href: '/account', label: 'Cuenta', icon: 'user' },
] as const

const hiddenPrefixes = ['/dashboard', '/auth', '/account/login', '/account/signup', '/checkout']

export function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/') return null
  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) return null

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
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
