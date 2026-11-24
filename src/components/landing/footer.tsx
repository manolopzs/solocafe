import Link from 'next/link'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'

const mainLinks = [
  { href: '/auth/login', label: 'I run a cafe' },
  { href: '/account/login', label: 'Customer sign in' },
  { href: '/auth/signup', label: 'Create account' },
  { href: '/demo', label: 'Demo' },
]

const legalLinks = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/terminos', label: 'Términos' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/contacto', label: 'Contacto' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="lg:max-w-sm">
            <Link href="/" aria-label="Solo Café, home">
              <SoloCafeWordmark height={24} />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Order ahead. Skip the queue. Pay at the counter.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            <nav aria-label="Solo Café links">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Solo Café
              </p>
              <ul className="mt-4 space-y-3">
                {mainLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Legal information">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Legal
              </p>
              <ul className="mt-4 space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
