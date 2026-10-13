'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const links = [
  { href: '#plataforma', label: 'Plataforma' },
  { href: '#clientes', label: 'Clientes' },
  { href: '#cafeterias', label: 'Cafeterías' },
  { href: '#precios', label: 'Precios' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" className="h-5 w-5" />
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} position="right" title="Menú">
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
          <Button asChild variant="ghost" className="justify-start">
            <Link href="/auth/login" onClick={() => setOpen(false)}>
              Entrar
            </Link>
          </Button>
          <Button asChild className="justify-start">
            <Link href="/auth/signup" onClick={() => setOpen(false)}>
              Empezar gratis
            </Link>
          </Button>
        </nav>
      </Sheet>
    </>
  )
}
