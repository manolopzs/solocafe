/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ShopDirectory, type DirectoryShop } from './shop-directory'

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

function shop(overrides: Partial<DirectoryShop>): DirectoryShop {
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
  it('shows Open for a shop with hours set', () => {
    render(<ShopDirectory sort="name" title="Hello" shops={[shop({ hours_configured: true })]} />)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('hides the open badge for a shop without hours', () => {
    render(<ShopDirectory sort="name" title="Hello" shops={[shop({ hours_configured: false })]} />)
    expect(screen.getByText('Café Norte')).toBeInTheDocument()
    expect(screen.queryByText('Open')).not.toBeInTheDocument()
    expect(screen.queryByText('Closed')).not.toBeInTheDocument()
  })
})

describe('ShopDirectory as Home', () => {
  it('links the shop card to its menu with a View menu pill and the real address', () => {
    render(<ShopDirectory sort="name" title="Good afternoon" shops={[shop({ slug: 'solo-cafe', name: 'Solo cafe', address: 'Antonio Acuña 8, Madrid' })]} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Good afternoon' })).toBeInTheDocument()
    const card = screen.getByText('View menu').closest('a')
    expect(card).toHaveAttribute('href', '/solo-cafe')
    expect(card).toHaveTextContent('Antonio Acuña 8, Madrid')
    expect(screen.getByText('1 coffee shop')).toBeInTheDocument()
  })

  it('uses cut-outs from the menu instead of a brand-colour block', () => {
    const { container } = render(
      <ShopDirectory sort="name" title="Hello" shops={[shop({ cutouts: ['/menu/cutouts/latte.png', '/menu/cutouts/cortado.png'] })]} />,
    )
    const art = container.querySelector('[data-testid="shop-art"]')!
    expect(art.querySelectorAll('img')).toHaveLength(2)
    expect(art.getAttribute('style')).toBeNull()
  })

  it('explains the single-shop network instead of leaving the screen empty', () => {
    render(<ShopDirectory sort="name" title="Hello" shops={[shop({})]} />)
    expect(screen.getByText('More coffee shops coming soon')).toBeInTheDocument()
  })

  it('has no example data or EJEMPLO badges', () => {
    const { container } = render(<ShopDirectory sort="name" title="Hello" shops={[shop({})]} />)
    expect(container).not.toHaveTextContent(/example/i)
  })
})
