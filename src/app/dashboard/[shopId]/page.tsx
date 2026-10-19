import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getShopAnalytics } from '@/server/queries/analytics'
import { getFullMenu } from '@/server/queries/menu'
import { getShopOrders } from '@/server/queries/orders'
import { QrCode } from '@/components/shop/qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { CopyButton } from '@/components/ui/copy-button'
import type { OrderStatus } from '@/types'

export const instant = false

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pendiente de pago',
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo',
  picked_up: 'Entregado',
  cancelled: 'Cancelado',
}

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending_payment: 'outline',
  received: 'warning',
  preparing: 'warning',
  ready: 'success',
  picked_up: 'success',
  cancelled: 'danger',
}

function formatCurrency(cents: number, currency: string) {
  return `${currency} ${(cents / 100).toFixed(2)}`
}

function formatTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatToday() {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

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
  const orders = await getShopOrders(shopId)
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${shop.slug}`

  const hasMenuItems = menu.items.length > 0
  const hasStripe = shop.stripe_connect_status === 'active'

  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const steps = [
    {
      label: 'Crear tu cafeteria',
      done: true,
      href: `/dashboard/${shopId}/settings`,
      description: 'Listo. Puedes editar los datos en Ajustes.',
    },
    {
      label: 'Definir tu menu',
      done: hasMenuItems,
      href: `/dashboard/${shopId}/menu`,
      description: hasMenuItems ? `${menu.items.length} productos listos.` : '5 a 7 opciones simples con poca configuracion.',
    },
    {
      label: 'Conectar Stripe',
      done: hasStripe,
      href: `/dashboard/${shopId}/settings`,
      description: hasStripe ? 'Recibes pagos directamente.' : 'Para recibir pagos con tarjeta, Apple Pay y Google Pay.',
    },
    {
      label: 'Compartir QR o enlace',
      done: hasMenuItems,
      href: `/dashboard/${shopId}/qr`,
      description: 'Imprime el QR o comparte el enlace con tus clientes.',
    },
    {
      label: 'Abrir la cocina',
      done: false,
      href: `/dashboard/${shopId}/kds`,
      description: 'Cumple pedidos y notifica a los clientes cuando esten listos.',
    },
  ]

  const completedSteps = steps.filter((s) => s.done).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-foreground">Resumen</h1>
        <p className="text-sm text-muted-foreground">{formatToday()} · Forecasting y operación de tu cafetería</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="receipt" className="h-4 w-4" />
              <span className="text-sm">Pedidos pagados</span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{analytics.order_count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="credit-card" className="h-4 w-4" />
              <span className="text-sm">Ingresos</span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {formatCurrency(analytics.revenue_cents, shop.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="tag" className="h-4 w-4" />
              <span className="text-sm">Ticket promedio</span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {formatCurrency(analytics.average_ticket_cents, shop.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon name="users" className="h-4 w-4" />
              <span className="text-sm">Clientes recurrentes</span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{analytics.repeat_customer_rate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horas pico</CardTitle>
            <CardDescription>Horarios con más pedidos.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.peak_hours.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay datos suficientes.</p>
            ) : (
              <div className="space-y-3">
                {analytics.peak_hours.map(({ hour, count }) => (
                  <div key={hour} className="flex items-center gap-3">
                    <span className="w-12 text-sm font-medium">{String(hour).padStart(2, '0')}:00</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.max(5, (count / analytics.peak_hours[0].count) * 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos top</CardTitle>
            <CardDescription>Lo más vendido por cantidad.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.top_items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay datos suficientes.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Producto</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cantidad</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analytics.top_items.map((item) => (
                      <tr key={item.name} className="bg-background">
                        <td className="px-4 py-3 text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {formatCurrency(item.revenue_cents, shop.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-foreground/20 transition-colors">
          <Link href={`/${shop.slug}`} target="_blank" className="block p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <Icon name="external-link" className="h-5 w-5 text-foreground" />
              </div>
              <Icon name="arrow-right" className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium text-foreground">Ver pagina de pedidos</p>
            <p className="text-sm text-muted-foreground">Abrir tienda publica</p>
          </Link>
        </Card>
        <Card className="hover:border-foreground/20 transition-colors">
          <Link href={`/dashboard/${shopId}/menu`} className="block p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <Icon name="menu" className="h-5 w-5 text-foreground" />
              </div>
              <Icon name="arrow-right" className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium text-foreground">Editar menu</p>
            <p className="text-sm text-muted-foreground">Productos y precios</p>
          </Link>
        </Card>
        <Card className="hover:border-foreground/20 transition-colors">
          <Link href={`/dashboard/${shopId}/kds`} className="block p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <Icon name="utensils" className="h-5 w-5 text-foreground" />
              </div>
              <Icon name="arrow-right" className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium text-foreground">Abrir cocina</p>
            <p className="text-sm text-muted-foreground">Vista de KDS</p>
          </Link>
        </Card>
        <Card className="hover:border-foreground/20 transition-colors">
          <Link href={`/dashboard/${shopId}/qr`} className="block p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <Icon name="qrcode" className="h-5 w-5 text-foreground" />
              </div>
              <Icon name="arrow-right" className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium text-foreground">Generar QR</p>
            <p className="text-sm text-muted-foreground">Imprimir o compartir</p>
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pedidos recientes</CardTitle>
            <CardDescription>Ultimos movimientos de tu tienda.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
                  <Icon name="receipt" className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">Sin pedidos aun</p>
                <p className="text-sm text-muted-foreground">Los pedidos apareceran aqui.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[28rem] text-sm">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hora</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="bg-background">
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[order.status]}>{statusLabels[order.status]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatTime(order.created_at)}</td>
                        <td className="px-4 py-3 text-foreground">{order.customer_name || 'Cliente'}</td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {formatCurrency(order.total_cents, order.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tu pagina de pedidos</CardTitle>
              <CardDescription>Comparte este enlace con tus clientes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground">
                <Icon name="external-link" className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{publicUrl}</span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href={`/${shop.slug}`} target="_blank">
                    <Icon name="external-link" className="mr-2 h-4 w-4" />
                    Ver pagina
                  </Link>
                </Button>
                <CopyButton text={publicUrl} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Codigo QR</CardTitle>
              <CardDescription>Escanea para abrir el menu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="inline-flex rounded-xl border border-border bg-background p-3">
                <QrCode url={publicUrl} size={180} className="h-36 w-36 sm:h-44 sm:w-44" />
              </div>
              <div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/${shopId}/qr`}>Gestionar QR</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
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
                className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:gap-4 ${
                  step.done ? 'border-success/20 bg-success/5' : 'border-border bg-surface'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    step.done ? 'bg-success text-success-foreground' : 'bg-surface text-muted-foreground border border-border'
                  }`}
                >
                  {step.done ? <Icon name="check" className="h-4 w-4" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${step.done ? 'text-success' : 'text-foreground'}`}>{step.label}</span>
                    {step.done && <Badge variant="success">Listo</Badge>}
                  </div>
                  <p className={`mt-0.5 text-sm ${step.done ? 'text-success/80' : 'text-muted-foreground'}`}>
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

      <Card>
        <CardHeader>
          <CardTitle>Pagos</CardTitle>
          <CardDescription>Conecta Stripe para recibir pagos directamente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {hasStripe ? (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-success" />
                <span className="font-medium text-foreground">Cuenta de Stripe conectada</span>
              </>
            ) : (
              <>
                <span className="flex h-2.5 w-2.5 rounded-full bg-warning" />
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
