import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { connectStripeAccount, syncStripeStatus } from '@/server/actions/stripe-connect'
import type { ShopOnboarding } from '@/types'
import { ShopSettingsForm } from '@/components/dashboard/shop-settings-form'
import { ShopPersonalityForm } from '@/components/dashboard/shop-personality-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'

export const instant = false

function stripeCopy(status: string) {
  if (status === 'active') {
    return {
      label: 'Cuenta de Stripe conectada',
      action: null as string | null,
      banner: 'Stripe quedó conectado. Ya puedes recibir pagos.',
    }
  }
  if (status === 'restricted') {
    return {
      label: 'Stripe necesita más datos para activar los cobros',
      action: 'Completar datos en Stripe',
      banner: 'Stripe recibió tus datos, pero los cobros siguen bloqueados.',
    }
  }
  if (status === 'pending') {
    return {
      label: 'Termina la conexión con Stripe',
      action: 'Continuar con Stripe',
      banner: 'Aún falta terminar la conexión con Stripe.',
    }
  }
  return {
    label: 'Aún no conectas Stripe',
    action: 'Conectar con Stripe',
    banner: 'Stripe todavía no tiene una cuenta para esta cafetería.',
  }
}

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

  let onboarding: ShopOnboarding | undefined = shop.onboarding
  if (stripeParam === 'connected') {
    try {
      onboarding = await syncStripeStatus(shopId)
    } catch {
      onboarding = shop.onboarding
    }
  }

  const stripeStatus = onboarding?.stripe.status ?? 'not_started'
  const stripe = stripeCopy(stripeStatus)
  const live = onboarding?.live ?? shop.status === 'active'
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${shop.slug}`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">Ajustes</h1>
        <p className="mt-1 text-muted-foreground">
          Configura la personalidad, los pagos y los datos de tu cafetería.
        </p>
      </div>

      <ShopPersonalityForm shopId={shopId} shop={shop} />

      {stripeParam === 'connected' && (
        <div className="rounded-xl border border-terracotta-200 bg-cream px-4 py-3 text-sm text-terracotta-800">
          {stripe.banner}
        </div>
      )}

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Pagos</CardTitle>
          <CardDescription>Conecta tu cuenta de Stripe para recibir pagos directamente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className={`flex h-2.5 w-2.5 rounded-full ${stripeStatus === 'active' ? 'bg-sage-500' : 'bg-terracotta-400'}`} />
            <span className="font-medium text-foreground">{stripe.label}</span>
          </div>
          {stripeStatus === 'active' ? (
            <Badge variant="success">Activo</Badge>
          ) : (
            <form action={connectStripeAccount.bind(null, shopId)}>
              <Button type="submit">{stripe.action}</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Página pública</CardTitle>
          <CardDescription>Enlace que ven tus clientes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {live ? (
            <>
          <div className="flex items-center gap-2 rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm font-medium text-foreground">
            <Icon name="external-link" className="h-4 w-4 text-warm-500" />
            <span className="truncate">{publicUrl}</span>
          </div>
          <Button asChild variant="outline">
            <Link href={`/${shop.slug}`} target="_blank">
              Ver página
            </Link>
          </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              El enlace público se activa cuando publiques la cafetería desde el resumen.
            </p>
          )}
        </CardContent>
      </Card>

      <ShopSettingsForm shopId={shopId} shop={shop} />
    </div>
  )
}
