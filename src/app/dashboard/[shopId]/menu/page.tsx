import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getFullMenu } from '@/server/queries/menu'
import { MenuTabs } from '@/components/menu/menu-tabs'

export const instant = false

export default async function MenuPage({
  params,
}: {
  params: Promise<{ shopId: string }>
}) {
  const { shopId } = await params
  const shop = await getShopById(shopId)
  if (!shop) notFound()

  const menu = await getFullMenu(shopId)

  return <MenuTabs shop={shop} menu={menu} />
}
