'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/ui/icon'

export function NavLink({ href, label, icon }: { href: string; label: string; icon: IconName }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={[
        'flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors md:w-full',
        active
          ? 'bg-warm-100 text-warm-900'
          : 'text-warm-700 hover:bg-warm-100 hover:text-warm-900',
      ].join(' ')}
    >
      <Icon name={icon} className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )
}
