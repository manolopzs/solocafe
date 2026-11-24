import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
import { MobileNav } from './mobile-nav'
import { Magnetic } from './magnetic'

const links = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function FloatingNav() {
  return (
    <div className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6">
    <nav aria-label="Main" className="mx-auto max-w-6xl rounded-full border border-border bg-background/90 py-1.5 pl-4 pr-1.5 shadow-float backdrop-blur-md lg:pl-5">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Solo Café, home">
          <SoloCafeWordmark height={24} />
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="landing-nav-link hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="whitespace-nowrap text-muted-foreground hover:text-foreground max-lg:hidden"
          >
            <Link href="/account/login">Customer sign in</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="whitespace-nowrap text-muted-foreground hover:text-foreground max-lg:hidden"
          >
            <Link href="#for-cafes">For cafes</Link>
          </Button>
          <Magnetic>
            <Button asChild variant="cta" size="sm" className="whitespace-nowrap">
              <Link href="#app">Get the app</Link>
            </Button>
          </Magnetic>
          <MobileNav />
        </div>
      </div>
    </nav>
    </div>
  )
}
