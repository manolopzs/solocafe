/** @jest-environment jsdom */
import { act, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { rememberGuestOrder, type GuestOrder } from '@/lib/guest-orders'
import { GuestOrders } from './guest-orders'

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href, className }: { children: ReactNode; href: string; className?: string }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))

const refreshGuestOrderStatuses = jest.fn()
jest.mock('@/server/actions/guest-orders', () => ({
  refreshGuestOrderStatuses: (...args: unknown[]) => refreshGuestOrderStatuses(...args),
}))

const saved = (id: string, createdAt: string, status: GuestOrder['status'], shopName = 'Solo cafe'): GuestOrder => ({
  id,
  token: `tok-${id}`,
  shopSlug: 'main',
  shopName,
  status,
  totalCents: 400,
  currency: 'EUR',
  itemCount: 2,
  createdAt,
})

const renderGuestOrders = () => render(<GuestOrders />)

// The store keeps one in-memory snapshot per module, so these tests build on each other in order.
describe('GuestOrders', () => {
  beforeEach(() => {
    refreshGuestOrderStatuses.mockReset()
    refreshGuestOrderStatuses.mockResolvedValue([])
  })

  it('shows an empty state with Explorar, not a login wall', () => {
    renderGuestOrders()
    expect(screen.getByText('Aún no tienes pedidos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar cafeterías' })).toHaveAttribute('href', '/explore')
    expect(screen.queryByText('Tu pedido en curso')).not.toBeInTheDocument()
    expect(refreshGuestOrderStatuses).not.toHaveBeenCalled()
  })

  it('shows the order in progress with a link to its status page, plus recent orders', async () => {
    rememberGuestOrder(saved('22222222-2222-4222-8222-222222222222', '2026-11-15T09:00:00Z', 'picked_up', 'Otra cafetería'))
    rememberGuestOrder(saved('11111111-1111-4111-8111-111111111111', '2026-11-16T09:30:00Z', 'preparing'))
    renderGuestOrders()
    await act(async () => {})

    expect(screen.getByText('Tu pedido en curso')).toBeInTheDocument()
    expect(screen.getByText('Preparando')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver estado del pedido' })).toHaveAttribute(
      'href',
      '/order/11111111-1111-4111-8111-111111111111?token=tok-11111111-1111-4111-8111-111111111111',
    )
    expect(screen.getByText('Pedidos recientes')).toBeInTheDocument()
    expect(screen.getByText('Otra cafetería')).toBeInTheDocument()
    expect(screen.getAllByText('4,00 €').length).toBeGreaterThan(0)
    expect(refreshGuestOrderStatuses).toHaveBeenCalledWith([
      { id: '11111111-1111-4111-8111-111111111111', token: 'tok-11111111-1111-4111-8111-111111111111' },
    ])
  })

  it('drops the in-progress card once a refresh says the order was picked up', async () => {
    refreshGuestOrderStatuses.mockResolvedValue([{ id: '11111111-1111-4111-8111-111111111111', status: 'picked_up' }])
    renderGuestOrders()
    await act(async () => {})

    expect(screen.queryByText('Tu pedido en curso')).not.toBeInTheDocument()
    expect(screen.getAllByText('Entregado')).toHaveLength(2)
    expect(window.localStorage.getItem('solo-cafe.guest-orders')).not.toContain('"preparing"')
  })
})
