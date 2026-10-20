import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getKitchenBoard } from '@/server/queries/orders'
import { getFullMenu } from '@/server/queries/menu'
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

  const [board, menu] = await Promise.all([getKitchenBoard(shopId), getFullMenu(shopId)])

  return (
    <KdsClient
      shopId={shopId}
      shopName={shop.name}
      initialOrders={board.orders}
      initialSync={board.sync}
      initialMenuItems={menu.items}
      initialCategories={menu.categories}
    />
  )
}
