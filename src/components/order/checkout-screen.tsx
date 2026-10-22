import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export interface CheckoutLine {
  id: string
  quantity: number
  name: string
  detail?: string
  amount: string
}

export function CheckoutScreen({
  backHref,
  title,
  orderCode,
  eta,
  lines,
  subtotal,
  discount,
  tax,
  total,
  children,
  paidHref,
}: {
  backHref: string
  title: string
  orderCode: string
  eta: string
  lines: CheckoutLine[]
  subtotal: string
  discount?: string | null
  tax?: string | null
  total: string
  children?: ReactNode
  paidHref?: string | null
}) {
  if (paidHref) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
            <Icon name="check" className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-3xl font-medium tracking-tight text-foreground">Pedido pagado</h1>
          <p className="mt-2 text-base leading-6 text-muted-foreground">
            Tu pedido ya fue pagado. Ve a la cafetería a recogerlo.
          </p>
          <Button asChild size="lg" className="mt-8 w-full">
            <Link href={paidHref}>Ver tu pedido</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-5 pb-24 pt-5 sm:pt-8">
        <Link href={backHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="arrow-left" className="h-4 w-4" />
          Volver al menú
        </Link>

        <p className="mt-8 text-sm text-muted-foreground">Pedido {orderCode}</p>
        <h1 className="mt-1 text-[2rem] font-medium leading-tight tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon name="clock" className="h-4 w-4" />
          {eta}
        </p>

        <ul className="mt-8 divide-y divide-border border-y border-border">
          {lines.map((line) => (
            <li key={line.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {line.quantity} × {line.name}
                </p>
                {line.detail && <p className="mt-0.5 text-sm text-muted-foreground">{line.detail}</p>}
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">{line.amount}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{subtotal}</dd>
          </div>
          {discount && (
            <div className="flex justify-between text-foreground">
              <dt>Recompensa</dt>
              <dd className="tabular-nums">-{discount}</dd>
            </div>
          )}
          {tax && (
            <div className="flex justify-between text-muted-foreground">
              <dt>Impuestos</dt>
              <dd className="tabular-nums">{tax}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between pt-3 text-foreground">
            <dt className="text-base font-medium">Total</dt>
            <dd className="text-2xl font-medium tabular-nums">{total}</dd>
          </div>
        </dl>

        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Pago</h2>
          <div className="mt-4">{children}</div>
        </section>
      </div>
    </main>
  )
}
