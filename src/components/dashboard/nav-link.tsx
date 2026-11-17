'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from '@/components/ui/icon'

export function NavLink({ href, label, icon, exact = false }: { href: string; label: string; icon: IconName; exact?: boolean }) {
  const pathname = usePathname()
  const active = pathname === href || (!exact && pathname.startsWith(`${href}/`))

  return (
    <Link
      href={href}
      className={[
        // Phone: 44px tabs with 16px padding and a 2px underline. Desktop: sidebar rows.
        'flex h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-body-sm font-semibold transition-colors md:h-auto md:w-full md:rounded-xl md:border-b-0 md:px-3 md:py-2.5',
        active
          ? 'border-foreground text-foreground md:bg-surface'
          : 'border-transparent text-muted-foreground hover:text-foreground md:hover:bg-surface',
      ].join(' ')}
    >
      <Icon name={icon} className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )
}
