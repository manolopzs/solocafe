import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { connectStripeAccount } from '@/server/actions/stripe-connect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'

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
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${shop.slug}`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ajustes</h1>
        <p className="mt-1 text-muted-foreground">
          Configura pagos y datos de tu cafeteria.
        </p>
      </div>

      {stripeParam === 'connected' && (
        <div className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          Conexion con Stripe completada. El estado se actualizara en unos segundos.
        </div>
      )}

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Pagos</CardTitle>
          <CardDescription>Conecta tu cuenta de Stripe para recibir pagos directamente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {isActive ? (
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
          {isActive ? (
            <Badge variant="success">Activo</Badge>
          ) : (
            <form action={connectStripeAccount.bind(null, shopId)}>
              <Button type="submit">Conectar con Stripe</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Pagina publica</CardTitle>
          <CardDescription>Enlace que ven tus clientes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm font-medium text-foreground">
            <Icon name="external-link" className="h-4 w-4 text-warm-500" />
            <span className="truncate">{publicUrl}</span>
          </div>
          <Button asChild variant="outline">
            <Link href={`/${shop.slug}`} target="_blank">
              Ver pagina
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
