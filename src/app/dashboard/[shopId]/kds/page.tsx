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

  return <KdsClient shopId={shopId} shopName={shop.name} initialOrders={orders} />
}
