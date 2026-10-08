import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Card, CardContent } from '@/components/ui/card'

export default function DemoSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <Icon name="check" className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground">Pedido recibido</h1>
          <p className="mt-2 text-muted-foreground">
            Esta es una demo. En produccion el pago se procesaria con Stripe.
          </p>
        </div>

        <Card variant="outline" className="mt-8 overflow-hidden">
          <div className="border-b border-warm-100 bg-cream px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detalle de la demo</p>
          </div>
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cafeteria</span>
              <span className="font-medium text-foreground">Cafe de la Esquina</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium text-foreground">Recibido</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pago</span>
              <span className="font-medium text-foreground">Simulado</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/demo">Volver al menu demo</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/demo/kds">Ver cocina demo</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
