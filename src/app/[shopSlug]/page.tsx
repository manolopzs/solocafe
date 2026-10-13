import { notFound } from 'next/navigation'
import { getShopBySlug } from '@/server/queries/shops'
import { getPublicMenu } from '@/server/queries/menu'
import { getCurrentCustomer, getCustomerOrder } from '@/server/queries/customers'
import { OrderPageClient } from '@/components/order/order-page-client'

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
    />
  )
}
