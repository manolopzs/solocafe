'use client'

import { KdsClient } from '@/components/kds/kds-client'
import { demoShop, demoOrders } from '@/lib/demo-data'

export default function DemoKdsPage() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <KdsClient shopId={demoShop.id} shopName={demoShop.name} initialOrders={demoOrders} autoPoll={false} />
    </main>
  )
}
