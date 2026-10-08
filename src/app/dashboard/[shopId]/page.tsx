import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getShopAnalytics } from '@/server/queries/analytics'
import { getFullMenu } from '@/server/queries/menu'
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
  const menu = await getFullMenu(shopId)
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${shop.slug}`

  const hasMenuItems = menu.items.length > 0
  const hasStripe = shop.stripe_connect_status === 'active'

  const steps = [
    {
      label: 'Crear tu cafeteria',
      done: true,
      href: '#',
      description: 'Listo. Puedes editar los datos en Ajustes.',
    },
    {
      label: 'Revisar tu menu',
      done: hasMenuItems,
      href: `/dashboard/${shopId}/menu`,
      description: hasMenuItems ? `${menu.items.length} productos listos.` : 'Agrega productos o edita los de ejemplo.',
    },
    {
      label: 'Conectar Stripe',
      done: hasStripe,
      href: `/dashboard/${shopId}/settings`,
      description: hasStripe ? 'Recibes pagos directamente.' : 'Para recibir pagos con tarjeta.',
    },
    {
      label: 'Compartir QR o enlace',
      done: hasMenuItems,
      href: `/dashboard/${shopId}/qr`,
      description: 'Imprime el QR o comparte el enlace.',
    },
    {
      label: 'Abrir la cocina',
      done: false,
      href: `/dashboard/${shopId}/kds`,
      description: 'Abre la tablet de cocina para recibir pedidos.',
    },
  ]

  const completedSteps = steps.filter((s) => s.done).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">Resumen</h1>
        <p className="mt-1 text-muted-foreground">
          Bienvenido a {shop.name}. Completa los pasos para empezar a vender.
        </p>
      </div>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Pasos para empezar</CardTitle>
          <CardDescription>
            {completedSteps} de {steps.length} completados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {steps.map((step, idx) => (
              <li
                key={step.label}
                className={`flex items-start gap-4 rounded-xl border p-4 ${
                  step.done ? 'border-sage-200 bg-sage-50/50' : 'border-warm-200 bg-paper'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    step.done ? 'bg-sage-500 text-white' : 'bg-warm-100 text-warm-600'
                  }`}
                >
                  {step.done ? <Icon name="check" className="h-4 w-4" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${step.done ? 'text-sage-900' : 'text-foreground'}`}>
                      {step.label}
                    </span>
                    {step.done && <Badge variant="success">Listo</Badge>}
                  </div>
                  <p className={`mt-0.5 text-sm ${step.done ? 'text-sage-700' : 'text-muted-foreground'}`}>
                    {step.description}
                  </p>
                </div>
                <Button asChild variant={step.done ? 'outline' : 'primary'} size="sm">
                  <Link href={step.href}>{step.done ? 'Revisar' : 'Hacer'}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="outline">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pedidos pagados</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{analytics.orderCount}</p>
          </CardContent>
        </Card>
        <Card variant="outline">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Ingresos</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {shop.currency} {(analytics.revenueCents / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card variant="outline">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Ticket promedio</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {shop.currency} {(analytics.averageTicketCents / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>
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
              <QrCode url={publicUrl} size={180} />
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/${shopId}/qr`}>Gestionar QR</Link>
              </Button>
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
            {hasStripe ? (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-sage-500" />
                <span className="font-medium text-foreground">Cuenta de Stripe conectada</span>
              </>
            ) : (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-terracotta-400" />
                <span className="font-medium text-foreground">Cuenta pendiente de conexion</span>
              </>
            )}
          </div>
          <Button asChild variant={hasStripe ? 'outline' : 'primary'}>
            <Link href={`/dashboard/${shopId}/settings`}>Gestionar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
