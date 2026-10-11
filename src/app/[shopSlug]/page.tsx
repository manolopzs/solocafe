import { notFound } from 'next/navigation'
import { getShopBySlug } from '@/server/queries/shops'
import { getPublicMenu } from '@/server/queries/menu'
import { getCurrentCustomer } from '@/server/queries/customers'
import { OrderPageClient } from '@/components/order/order-page-client'

export const instant = false

export default async function PublicOrderPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>
}) {
  const { shopSlug } = await params
  const shop = await getShopBySlug(shopSlug)
  if (!shop) notFound()

  const [menu, customer] = await Promise.all([
    getPublicMenu(shop.id),
    getCurrentCustomer(),
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
    />
  )
}
