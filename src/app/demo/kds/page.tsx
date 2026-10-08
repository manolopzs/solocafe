'use client'

import { KdsClient } from '@/components/kds/kds-client'
import { demoShop, demoOrders } from '@/lib/demo-data'

export default function DemoKdsPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Cocina demo</h1>
            <p className="text-muted-foreground">Asi se ven los pedidos en la tablet de la cafeteria.</p>
          </div>
        </div>
        <KdsClient shopId={demoShop.id} initialOrders={demoOrders} autoPoll={false} />
      </div>
    </main>
  )
}
