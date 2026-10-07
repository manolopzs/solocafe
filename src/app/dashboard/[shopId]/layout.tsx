import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { LogoutButton } from '@/components/auth/logout-button'

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

  const nav = [
    { href: `/dashboard/${shopId}`, label: 'Resumen' },
    { href: `/dashboard/${shopId}/menu`, label: 'Menu' },
    { href: `/dashboard/${shopId}/kds`, label: 'Cocina' },
    { href: `/dashboard/${shopId}/settings`, label: 'Ajustes' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-zinc-900">
              Solo Cafe
            </Link>
            <span className="text-sm text-zinc-500">{shop.name}</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <aside className="w-48 border-r border-zinc-200 px-6 py-6">
          <nav className="space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
