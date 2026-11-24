'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const links = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" className="h-5 w-5" />
      </Button>
      {open &&
        createPortal(
          <Sheet open={open} onClose={() => setOpen(false)} position="right" title="Menu">
            <nav className="flex flex-col gap-2 py-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              <Button asChild variant="cta" className="justify-start">
                <Link href="#app" onClick={() => setOpen(false)}>Get the app</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/account/login" onClick={() => setOpen(false)}>
                  Customer sign in
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="#for-cafes" onClick={() => setOpen(false)}>
                  For cafes
                </Link>
              </Button>
            </nav>
          </Sheet>,
          document.body
        )}
    </>
  )
}
