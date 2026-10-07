import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getShopAnalytics } from '@/server/queries/analytics'
import { QrCode } from '@/components/shop/qr-code'

export const instant = false

export default async function ShopDashboardPage({
  params,
}: {
  params: Promise<{ shopId: string }>
}) {
  const { shopId } = await params
  const shop = await getShopById(shopId)
  if (!shop) notFound()

  const analytics = await getShopAnalytics(shopId)
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${shop.slug}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Resumen</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Configura tu menu y comparte el codigo QR con tus clientes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Pedidos pagados</h2>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{analytics.orderCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Ingresos</h2>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {shop.currency} {(analytics.revenueCents / 100).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Ticket promedio</h2>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {shop.currency} {(analytics.averageTicketCents / 100).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Tu pagina de pedidos</h2>
          <p className="mt-2 break-all text-sm font-medium text-zinc-900">
            {publicUrl}
          </p>
          <Link
            href={`/${shop.slug}`}
            target="_blank"
            className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Ver pagina
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Codigo QR</h2>
          <div className="mt-2">
            <QrCode url={publicUrl} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-medium text-zinc-500">Stripe Connect</h2>
          <p className="mt-2 text-sm text-zinc-900">
            {shop.stripe_connect_status === 'active'
              ? 'Cuenta conectada'
              : 'Cuenta pendiente de conexion'}
          </p>
          <Link
            href={`/dashboard/${shopId}/settings`}
            className="mt-4 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Gestionar
          </Link>
        </div>
      </div>
    </div>
  )
}
