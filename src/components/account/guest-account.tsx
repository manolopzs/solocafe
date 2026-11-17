import Link from 'next/link'
import { Button } from '@/components/ui/button'

/** Why a guest would sign up. Each line must stay true of the product as it works today. */
export const ACCOUNT_REASONS = [
  {
    title: 'Tu nombre y teléfono, guardados',
    body: 'No tienes que escribirlos en cada pedido.',
  },
  {
    title: 'Repite tu pedido en un toque',
    body: 'Tu café de siempre, sin buscarlo en la carta.',
  },
  {
    title: 'Sellos en cada pedido',
    body: 'Cada pedido pagado suma un sello en tu tarjeta.',
  },
] as const

/** Cuenta for guests: the reasons to sign up instead of a login wall. */
export function GuestAccount() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-5 pb-28 pt-8">
        <h1 className="text-[2rem] font-medium leading-tight tracking-tight text-foreground">Tu cuenta</h1>
        <p className="mt-2 max-w-[30ch] text-base leading-6 text-muted-foreground">
          Puedes pedir sin cuenta. Con una, pides más rápido.
        </p>

        <ul className="mt-7 border-b border-border">
          {ACCOUNT_REASONS.map((reason) => (
            <li key={reason.title} className="border-t border-border py-4">
              <p className="text-lg font-semibold leading-snug text-foreground">{reason.title}</p>
              <p className="mt-1 text-[0.95rem] leading-6 text-muted-foreground">{reason.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-center gap-1">
          <Button asChild size="lg" className="h-14 w-full rounded-full text-base">
            <Link href="/account/signup">Crear cuenta</Link>
          </Button>
          <Link
            href="/account/login"
            className="inline-flex min-h-11 items-center px-3 text-base font-semibold text-accent underline underline-offset-4"
          >
            Ya tengo cuenta · Entrar
          </Link>
        </div>
      </div>
    </main>
  )
}
