import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { connectStripeAccount } from '@/server/actions/stripe-connect'

export const instant = false

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopId: string }>
  searchParams: Promise<{ stripe?: string }>
}) {
  const { shopId } = await params
  const { stripe: stripeParam } = await searchParams
  const shop = await getShopById(shopId)
  if (!shop) notFound()

  const isActive = shop.stripe_connect_status === 'active'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Ajustes</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Configura pagos y datos de tu cafeteria.
        </p>
      </div>

      {stripeParam === 'connected' && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
          Conexion con Stripe completada. El estado se actualizara en unos segundos.
        </div>
      )}

      <section className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-lg font-medium text-zinc-900">Pagos</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Conecta tu cuenta de Stripe para recibir pagos directamente.
        </p>
        <div className="mt-4">
          {isActive ? (
            <p className="text-sm font-medium text-green-700">Cuenta de Stripe conectada</p>
          ) : (
            <form action={connectStripeAccount.bind(null, shopId)}>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Conectar con Stripe
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-lg font-medium text-zinc-900">Pagina publica</h2>
        <p className="mt-1 break-all text-sm text-zinc-900">
          {process.env.NEXT_PUBLIC_APP_URL}/{shop.slug}
        </p>
        <Link
          href={`/${shop.slug}`}
          target="_blank"
          className="mt-4 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Ver pagina
        </Link>
      </section>
    </div>
  )
}
