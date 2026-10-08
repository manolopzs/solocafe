'use client'

import { useRouter } from 'next/navigation'
import { OrderPageClient } from '@/components/order/order-page-client'
import {
  demoShop,
  demoCategories,
  demoItems,
  demoModifierGroups,
  demoModifierOptions,
  demoItemModifierLinks,
} from '@/lib/demo-data'

export default function DemoOrderPage() {
  const router = useRouter()

  return (
    <OrderPageClient
      shop={demoShop}
      categories={demoCategories}
      items={demoItems}
      modifierGroups={demoModifierGroups}
      modifierOptions={demoModifierOptions}
      itemModifierLinks={demoItemModifierLinks}
      onCreateOrder={() => {
        router.push('/demo/success')
      }}
    />
  )
}
