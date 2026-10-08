import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getShopAnalytics } from '@/server/queries/analytics'
import { QrCode } from '@/components/shop/qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'

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

  const statCards = [
    { label: 'Pedidos pagados', value: analytics.orderCount },
    {
      label: 'Ingresos',
      value: `${shop.currency} ${(analytics.revenueCents / 100).toFixed(2)}`,
    },
    {
      label: 'Ticket promedio',
      value: `${shop.currency} ${(analytics.averageTicketCents / 100).toFixed(2)}`,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Resumen</h1>
        <p className="mt-1 text-muted-foreground">
          Configura tu menu y comparte el codigo QR con tus clientes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.label} variant="outline">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="outline">
          <CardHeader>
            <CardTitle>Tu pagina de pedidos</CardTitle>
            <CardDescription>Comparte este enlace con tus clientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm font-medium text-foreground">
              <Icon name="external-link" className="h-4 w-4 text-warm-500" />
              <span className="truncate">{publicUrl}</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/${shop.slug}`} target="_blank">
                  Ver pagina
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={`/dashboard/${shopId}/menu`}>Editar menu</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>Codigo QR</CardTitle>
            <CardDescription>Escanea para abrir el menu.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="inline-flex rounded-2xl border border-warm-200 bg-white p-3">
              <QrCode url={publicUrl} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Pagos</CardTitle>
          <CardDescription>Conecta Stripe para recibir pagos directamente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {shop.stripe_connect_status === 'active' ? (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-success" />
                <span className="font-medium text-foreground">Cuenta de Stripe conectada</span>
              </>
            ) : (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="font-medium text-foreground">Cuenta pendiente de conexion</span>
              </>
            )}
          </div>
          <Button asChild variant={shop.stripe_connect_status === 'active' ? 'outline' : 'primary'}>
            <Link href={`/dashboard/${shopId}/settings`}>Gestionar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
