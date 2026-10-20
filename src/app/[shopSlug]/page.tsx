import { notFound } from 'next/navigation'
import { getShopBySlug } from '@/server/queries/shops'
import { getPublicMenu } from '@/server/queries/menu'
import { getCurrentCustomer, getCustomerOrder } from '@/server/queries/customers'
import { getShopFavorites } from '@/server/queries/favorites'
import { getRecentOrders } from '@/server/queries/recentOrders'
import { getUsualOrder } from '@/server/queries/orders'
import { OrderPageClient } from '@/components/order/order-page-client'
import type { Order, UsualOrder } from '@/types'

export const instant = false

export default async function PublicOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>
  searchParams: Promise<{ reorder?: string }>
}) {
  const { shopSlug } = await params
  const { reorder: reorderOrderId } = await searchParams
  const shop = await getShopBySlug(shopSlug)
  if (!shop) notFound()

  const [menu, customer, reorderOrder] = await Promise.all([
    getPublicMenu(shop.id),
    getCurrentCustomer(),
    reorderOrderId ? getCustomerOrder(reorderOrderId) : Promise.resolve(null),
  ])

  let favoriteIds: string[] = []
  let recentOrders: Order[] = []
  let usualOrder: UsualOrder | null = null
  if (customer) {
    ;[favoriteIds, recentOrders, usualOrder] = await Promise.all([
      getShopFavorites(shop.id),
      getRecentOrders(shop.id),
      getUsualOrder(shop.id),
    ])
  }

  const reorderCount = reorderOrder?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <OrderPageClient
      shop={shop}
      categories={menu.categories}
      items={menu.items}
      modifierGroups={menu.modifierGroups}
      modifierOptions={menu.modifierOptions}
      itemModifierLinks={menu.itemModifierLinks}
      customer={customer}
      reorderOrder={reorderOrder}
      reorderCount={reorderCount}
      favoriteIds={favoriteIds}
      recentOrders={recentOrders}
      usualOrder={usualOrder}
    />
  )
}
