import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getShopOrders } from '@/server/queries/orders'
import { KdsClient } from '@/components/kds/kds-client'

export const instant = false

export default async function KdsPage({
  params,
}: {
  params: Promise<{ shopId: string }>
}) {
  const { shopId } = await params
  const shop = await getShopById(shopId)
  if (!shop) notFound()

  const orders = await getShopOrders(shopId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">Cocina</h1>
        <p className="mt-1 text-muted-foreground">
          Pantalla de preparacion para la barra.
        </p>
      </div>
      <KdsClient shopId={shopId} initialOrders={orders} />
    </div>
  )
}
