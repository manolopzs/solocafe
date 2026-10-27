import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-lg rounded-3xl border border-terracotta-200 bg-cream px-8 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-700 text-white">
          <Icon name="coffee" className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-terracotta-700">404</p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground">Esta página no existe</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          El enlace no corresponde a ninguna sección de Solo Cafe. Vuelve al inicio o entra como cafetería.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-terracotta-700 px-6 text-sm font-medium text-white"
          >
            Volver al inicio
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-terracotta-300 bg-background px-6 text-sm font-medium text-terracotta-800"
          >
            Soy cafetería
          </Link>
        </div>
      </div>
    </main>
  )
}
