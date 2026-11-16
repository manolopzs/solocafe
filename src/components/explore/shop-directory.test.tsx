/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ShopDirectory } from './shop-directory'
import type { PublicShop } from '@/server/queries/explore'

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

function shop(overrides: Partial<PublicShop>): PublicShop {
  return {
    name: 'Café Norte',
    slug: 'cafe-norte',
    address: null,
    open_now: true,
    brand_color: '#1f4d3a',
    display_font: 'fraunces',
    hero_photo_url: null,
    ...overrides,
  }
}

describe('ShopDirectory open badge', () => {
  it('shows Abierto for a shop with hours set', () => {
    render(<ShopDirectory sort="name" shops={[shop({ hours_configured: true })]} />)
    expect(screen.getByText('Abierto')).toBeInTheDocument()
  })

  it('hides the open badge for a shop without hours', () => {
    render(<ShopDirectory sort="name" shops={[shop({ hours_configured: false })]} />)
    expect(screen.getByText('Café Norte')).toBeInTheDocument()
    expect(screen.queryByText('Abierto')).not.toBeInTheDocument()
    expect(screen.queryByText('Cerrado')).not.toBeInTheDocument()
  })
})
