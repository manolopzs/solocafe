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
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" aria-label="Solo Café, home">
            <SoloCafeWordmark height={24} />
          </Link>
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Order ahead, skip the queue, pay at the counter.
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav
          aria-label="Legal information"
          className="mx-auto mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
