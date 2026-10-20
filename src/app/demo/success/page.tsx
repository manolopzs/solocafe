import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export default function DemoSuccessPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <Icon name="check" className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-[2rem] font-medium leading-tight tracking-tight text-foreground">Pedido recibido</h1>
        <p className="mt-2 text-base leading-6 text-muted-foreground">
          Esta es una demo. En producción el pago se procesaría con Stripe.
        </p>

        <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">Cafetería</dt>
            <dd className="font-medium text-foreground">Cafe de la Esquina</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">Estado</dt>
            <dd className="font-medium text-foreground">Recibido</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted-foreground">Pago</dt>
            <dd className="font-medium text-foreground">Simulado</dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/demo">Volver al menú demo</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/demo/kds">Ver cocina demo</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
