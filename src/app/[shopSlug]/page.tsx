import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCurrentCustomer, getCustomerOrder } from '@/server/queries/customers'
import { getShopFavorites } from '@/server/queries/favorites'
import { getRecentOrders } from '@/server/queries/recentOrders'
import { getUsualOrder } from '@/server/queries/orders'
import { getPublicStorefront } from '@/server/queries/storefront'
import { OrderPageClient } from '@/components/order/order-page-client'
import { ShopHero } from '@/components/shop/shop-hero'
import { shopThemeVars } from '@/lib/shop-theme'
import type { Order, UsualOrder } from '@/types'

export const instant = false

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }): Promise<Metadata> {
  const { shopSlug } = await params
  const storefront = await getPublicStorefront(shopSlug)
  const shopName = storefront?.shop.name ?? 'Solo Café'
  return {
    title: `${shopName} · Pedido para recoger`,
  }
}

export default async function PublicOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>
  searchParams: Promise<{ reorder?: string }>
}) {
  const { shopSlug } = await params
  const { reorder: reorderOrderId } = await searchParams
  const signedIn = Boolean((await cookies()).get('token')?.value)
  const [storefront, reorderOrder, customer] = await Promise.all([
    getPublicStorefront(shopSlug),
    reorderOrderId ? getCustomerOrder(reorderOrderId) : Promise.resolve(null),
    signedIn ? getCurrentCustomer() : Promise.resolve(null),
  ])
  if (!storefront) notFound()

  const { shop, menu } = storefront
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
    <div style={shopThemeVars(shop.brand_color, shop.display_font)}>
      <ShopHero name={shop.name} heroPhotoUrl={shop.hero_photo_url} />
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
    </div>
  )
}
