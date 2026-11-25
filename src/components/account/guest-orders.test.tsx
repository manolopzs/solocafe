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

const saved = (
  id: string,
  createdAt: string,
  status: GuestOrder['status'],
  shopName = 'Solo cafe',
  extra: Partial<GuestOrder> = {},
): GuestOrder => ({
  id,
  token: `tok-${id}`,
  shopSlug: 'main',
  shopName,
  status,
  totalCents: 400,
  currency: 'EUR',
  locale: 'es',
  itemCount: 2,
  createdAt,
  ...extra,
})

const renderGuestOrders = () => render(<GuestOrders />)

// The store keeps one in-memory snapshot per module, so these tests build on each other in order.
describe('GuestOrders', () => {
  beforeEach(() => {
    refreshGuestOrderStatuses.mockReset()
    refreshGuestOrderStatuses.mockResolvedValue([])
  })

  afterEach(() => jest.useRealTimers())

  it('shows an empty state that leads to Home, not a login wall', () => {
    renderGuestOrders()
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Order a coffee' })).toHaveAttribute('href', '/inicio')
    expect(screen.queryByText('Your order in progress')).not.toBeInTheDocument()
    expect(refreshGuestOrderStatuses).not.toHaveBeenCalled()
  })

  it('shows active and past tabs with grouped rows', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-16T12:00:00Z'))
    rememberGuestOrder(
      saved('22222222-2222-4222-8222-2222222222aa', '2026-11-15T09:00:00Z', 'picked_up', 'Another coffee shop', {
        shopSlug: 'otra',
        itemsSummary: '2 × Cortado',
      }),
    )
    rememberGuestOrder(saved('11111111-1111-4111-8111-1111111111bc', '2026-11-16T09:30:00Z', 'preparing'))
    renderGuestOrders()
    await act(async () => {})

    expect(screen.getByRole('img', { name: 'Solo Café' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Orders' })).toHaveClass('text-h1', 'text-heading')
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Today')).not.toHaveClass('uppercase')
    const activeMeta = screen.getByText('Preparing').parentElement
    expect(activeMeta).toHaveTextContent('Preparing · Code 11BC')
    expect(activeMeta).not.toHaveTextContent('16 Nov')

    // Past tab
    screen.getByRole('button', { name: 'Past' }).click()
    await act(async () => {})
    expect(screen.getByText('2 × Cortado')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).not.toHaveClass('uppercase')
    const pastTitle = screen.getByText('Another coffee shop')
    expect(pastTitle).toHaveClass('text-muted-foreground')
    expect(pastTitle.closest('div')?.querySelector('a span')).toHaveClass('text-muted-foreground')
    const pastMeta = screen.getByText('Picked up').parentElement
    expect(pastMeta).not.toHaveTextContent('15 Nov')
    expect(screen.getByRole('link', { name: /^Order again/ })).toHaveAttribute(
      'href',
      '/otra?reorder=22222222-2222-4222-8222-2222222222aa&token=tok-22222222-2222-4222-8222-2222222222aa',
    )
    expect(refreshGuestOrderStatuses).toHaveBeenCalledWith([
      { id: '11111111-1111-4111-8111-1111111111bc', token: 'tok-11111111-1111-4111-8111-1111111111bc' },
    ])
  })

  it('drops the active row once a refresh says the order was picked up', async () => {
    refreshGuestOrderStatuses.mockResolvedValue([{ id: '11111111-1111-4111-8111-1111111111bc', status: 'picked_up' }])
    renderGuestOrders()
    await act(async () => {})

    expect(screen.queryByText('Preparing')).not.toBeInTheDocument()
    screen.getByRole('button', { name: 'Past' }).click()
    await act(async () => {})
    expect(screen.getAllByText(/Picked up/)).toHaveLength(2)
    expect(window.localStorage.getItem('solo-cafe.guest-orders')).not.toContain('"preparing"')
  })
})
