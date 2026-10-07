import { notFound } from 'next/navigation'
import { getShopBySlug } from '@/server/queries/shops'
import { getPublicMenu } from '@/server/queries/menu'
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

  const menu = await getPublicMenu(shop.id)

  return (
    <OrderPageClient
      shop={shop}
      categories={menu.categories}
      items={menu.items}
      modifierGroups={menu.modifierGroups}
      modifierOptions={menu.modifierOptions}
      itemModifierLinks={menu.itemModifierLinks}
    />
  )
}
