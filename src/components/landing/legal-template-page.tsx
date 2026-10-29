import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'
import { LegalEmailLink, LegalPlaceholder, type LegalPlaceholderName } from '@/components/landing/legal-placeholder'

const legalLinks = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/terminos', label: 'Términos' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/contacto', label: 'Contacto' },
]

const identityRows: { label: string; name: LegalPlaceholderName; email?: boolean }[] = [
  { label: 'Razón social', name: 'legalName' },
  { label: 'NIF o CIF', name: 'taxId' },
  { label: 'Domicilio social', name: 'address' },
  { label: 'Correo de contacto', name: 'email', email: true },
  { label: 'Registro mercantil', name: 'registry' },
  { label: 'Última actualización', name: 'updatedAt' },
]

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function LegalTemplatePage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-700 text-white">
              <Icon name="coffee" className="h-5 w-5" />
            </span>
            <span className="font-semibold">Solo Café</span>
          </Link>
          <Link href="/auth/login" className="text-sm font-medium text-terracotta-800 hover:text-foreground">
            Soy cafetería
          </Link>
        </div>
      </header>
      <article className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-terracotta-700">
          Plantilla para el derecho español
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Cada recuadro resaltado es un marcador. Sustitúyelo por el dato real de la empresa antes de publicar. Esos recuadros no identifican a ninguna empresa. Esta plantilla no sustituye el consejo de un abogado.
        </p>
        <p className="mt-3 text-sm text-foreground">
          Última actualización: <LegalPlaceholder name="updatedAt" />
        </p>
        <dl className="mt-8 grid gap-4 rounded-2xl border border-terracotta-200 bg-cream p-6 text-sm sm:grid-cols-2">
          {identityRows.map((row) => (
            <div key={row.name}>
              <dt className="font-semibold text-terracotta-800">{row.label}</dt>
              <dd className="mt-1 text-foreground">
                {row.email ? <LegalEmailLink /> : <LegalPlaceholder name={row.name} />}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 space-y-8 text-base leading-7 text-foreground">{children}</div>
      </article>
      <footer className="border-t border-border px-6 py-8">
        <nav aria-label="Información legal" className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </footer>
    </main>
  )
}
