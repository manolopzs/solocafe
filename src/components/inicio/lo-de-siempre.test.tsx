/** @jest-environment jsdom */
import { act, render, screen } from '@testing-library/react'
import { GuestLoDeSiempre, LoDeSiempre } from './lo-de-siempre'
import { AccountAvatar } from './account-avatar'
import { rememberGuestOrder } from '@/lib/guest-orders'
import type { LastOrder } from '@/lib/last-order'

const last: LastOrder = {
  id: 'o1',
  shopName: 'Solo cafe',
  itemsSummary: '1 × Latte',
  totalCents: 200,
  currency: 'EUR',
  etaMinutes: 15,
  reorderHref: '/solo-cafe?reorder=o1',
  cutout: '/menu/cutouts/latte.png',
}

describe('LoDeSiempre', () => {
  it('renders nothing without a previous order', () => {
    const { container } = render(<LoDeSiempre order={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the order and an espresso "Pedir otra vez" with the price', () => {
    render(<LoDeSiempre order={last} />)
    expect(screen.getByText('Lo de siempre · Solo cafe')).toBeInTheDocument()
    expect(screen.getByText('1 × Latte')).toBeInTheDocument()
    expect(screen.getByText('2,00 € · listo en ~15 min')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Pedir otra vez · 2,00 €/ })
    expect(link).toHaveAttribute('href', '/solo-cafe?reorder=o1')
    expect(link.className).toContain('bg-foreground')
    expect(link.className).not.toContain('bg-cta')
  })

  it('leaves the time out when the order has none', () => {
    render(<LoDeSiempre order={{ ...last, etaMinutes: null }} />)
    expect(screen.getByText('2,00 €')).toBeInTheDocument()
    expect(screen.queryByText(/listo en/)).not.toBeInTheDocument()
  })
})

describe('GuestLoDeSiempre', () => {
  beforeEach(() => window.localStorage.clear())

  it('appears once this phone has placed an order', () => {
    const { container } = render(<GuestLoDeSiempre />)
    expect(container).toBeEmptyDOMElement()
    act(() => {
      rememberGuestOrder({
        id: 'g1',
        token: 'tok',
        shopSlug: 'solo-cafe',
        shopName: 'Solo cafe',
        status: 'picked_up',
        totalCents: 200,
        currency: 'EUR',
        itemCount: 1,
        itemsSummary: '1 × Latte',
        createdAt: '2026-11-10T10:00:00Z',
      })
    })
    expect(screen.getByRole('link', { name: /Pedir otra vez/ })).toHaveAttribute('href', '/solo-cafe?reorder=g1&token=tok')
  })
})

describe('AccountAvatar', () => {
  it('shows the initial in a 44px tap zone linking to the account', () => {
    render(<AccountAvatar name="lucía" />)
    const link = screen.getByRole('link', { name: 'Tu cuenta' })
    expect(link).toHaveAttribute('href', '/account')
    expect(link.className).toContain('h-11')
    expect(link).toHaveTextContent('L')
  })
})
