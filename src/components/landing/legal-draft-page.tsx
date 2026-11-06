import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'

const legalLinks = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/terminos', label: 'Términos' },
  { href: '/cookies', label: 'Cookies' },
  { href: 'mailto:', label: 'Contacto', external: true },
]

export function LegalDraftPage({ title, children }: { title: string; children: ReactNode }) {
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
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <div className="mt-6 space-y-4 text-base leading-7 text-foreground">{children}</div>
      </article>
      <footer className="border-t border-border px-6 py-8">
        <nav aria-label="Información legal" className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {legalLinks.map((link) =>
            link.external ? (
              <a key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            )
          )}
        </nav>
      </footer>
    </main>
  )
}
