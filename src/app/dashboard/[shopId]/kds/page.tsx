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
    <div className="h-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Cocina</h1>
        <p className="text-sm text-zinc-600">Actualizacion en tiempo real</p>
      </div>
      <KdsClient shopId={shopId} initialOrders={orders} />
    </div>
  )
}
