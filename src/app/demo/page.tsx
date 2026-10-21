'use client'

import { useRouter } from 'next/navigation'
import { OrderPageClient } from '@/components/order/order-page-client'
import { ShopHero } from '@/components/shop/shop-hero'
import { shopThemeVars } from '@/lib/shop-theme'
import {
  demoShop,
  demoCategories,
  demoItems,
  demoModifierGroups,
  demoModifierOptions,
  demoItemModifierLinks,
} from '@/lib/demo-data'

const shop = { ...demoShop, hero_photo_url: '/images/cafe-interior.jpg' }

export default function DemoOrderPage() {
  const router = useRouter()

  return (
    <div style={shopThemeVars(shop.brand_color, shop.display_font)}>
      <ShopHero name={shop.name} heroPhotoUrl={shop.hero_photo_url} />
      <OrderPageClient
        shop={shop}
        categories={demoCategories}
        items={demoItems}
        modifierGroups={demoModifierGroups}
        modifierOptions={demoModifierOptions}
        itemModifierLinks={demoItemModifierLinks}
        customer={null}
        reorderOrder={null}
        reorderCount={0}
        favoriteIds={[]}
        recentOrders={[]}
        usualOrder={null}
        livePreview={false}
        onCreateOrder={() => {
          router.push('/demo/success')
        }}
      />
    </div>
  )
}
