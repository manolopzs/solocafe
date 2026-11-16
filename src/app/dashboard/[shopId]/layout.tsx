import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { LogoutButton } from '@/components/auth/logout-button'
import { type IconName } from '@/components/ui/icon'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import { NavLink } from '@/components/dashboard/nav-link'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ shopId: string }>
}) {
  const { shopId } = await params
  const shop = await getShopById(shopId)
  if (!shop) notFound()

  const nav: { href: string; label: string; icon: IconName }[] = [
    { href: `/dashboard/${shopId}`, label: 'Resumen', icon: 'store' },
    { href: `/dashboard/${shopId}/menu`, label: 'Menú', icon: 'receipt' },
    { href: `/dashboard/${shopId}/kds`, label: 'Cocina', icon: 'utensils' },
    { href: `/dashboard/${shopId}/qr`, label: 'QR', icon: 'qrcode' },
    { href: `/dashboard/${shopId}/settings`, label: 'Ajustes', icon: 'settings' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/94 px-5 pt-[env(safe-area-inset-top)] backdrop-blur-[14px]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex min-h-11 items-center" aria-label="Solo Café, inicio">
              <SoloCafeWordmark height={24} />
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">/</span>
            <span className="hidden max-w-[200px] truncate text-sm font-medium text-foreground sm:inline">
              {shop.name}
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <aside className="relative border-b border-border bg-background md:w-56 md:border-b-0 md:border-r md:px-5 md:py-6">
          <nav className="no-scrollbar flex overflow-x-auto px-3 md:flex-col md:gap-1 md:overflow-visible md:px-0">
            {nav.map((item, index) => (
              <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} exact={index === 0} />
            ))}
          </nav>
          {/* 24px fade on the right edge says the tabs scroll */}
          <span className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-background/0 md:hidden" aria-hidden="true" />
        </aside>
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}


