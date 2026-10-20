import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { LogoutButton } from '@/components/auth/logout-button'
import { Icon, type IconName } from '@/components/ui/icon'
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
    { href: `/dashboard/${shopId}/menu`, label: 'Menu', icon: 'receipt' },
    { href: `/dashboard/${shopId}/kds`, label: 'Cocina', icon: 'utensils' },
    { href: `/dashboard/${shopId}/qr`, label: 'QR', icon: 'qrcode' },
    { href: `/dashboard/${shopId}/settings`, label: 'Ajustes', icon: 'settings' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-warm-200 bg-paper/80 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-sm">
                <Icon name="coffee" className="h-5 w-5" />
              </div>
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground">Solo Cafe</span>
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
        <aside className="border-b border-warm-200 bg-paper px-5 py-4 md:w-56 md:border-b-0 md:border-r md:py-6">
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1 md:overflow-visible">
            {nav.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </nav>
        </aside>
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}


