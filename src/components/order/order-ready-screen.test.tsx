/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { OrderStatusClient } from '@/components/order/order-status-client'
import { readyFirstName } from '@/components/order/order-ready-screen'
import type { Order } from '@/types'

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

jest.mock('@/server/queries/orders', () => ({
  getOrderWithItems: jest.fn(async () => null),
}))

const ORDER_ID = 'a1b2c3d4-0000-4000-8000-00000000c0de'

function readyOrder(overrides: Partial<Order> = {}) {
  return {
    id: ORDER_ID,
    shop_id: 'shop-1',
    shop: { name: 'Cafetería de prueba', slug: 'prueba' },
    status: 'ready',
    customer_id: null,
    customer_name: 'Ana María López',
    pickup_type: 'asap',
    subtotal_cents: 350,
    total_cents: 350,
    currency: 'eur',
    created_at: new Date().toISOString(),
    loyalty: null,
    items: [
      { id: 'i1', quantity: 1, item_name_snapshot: 'Cortado', modifiers: [{ id: 'm1', option_name_snapshot: 'Leche de avena' }] },
    ],
    ...overrides,
  } as unknown as Order & { items: [] }
}

describe('Ready screen on the order status page', () => {
  it('greets the customer by first name and shows the big pickup code', () => {
    render(<OrderStatusClient initialOrder={readyOrder()} />)
    expect(screen.getByTestId('order-ready-screen')).toHaveClass('bg-listo-bg')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Ready, Ana!$/)
    expect(screen.getByTestId('ready-pickup-code')).toHaveTextContent(/^C0DE$/)
    expect(screen.getByText('Say it, or tap to show this at the counter')).toBeInTheDocument()
  })

  it('sets the heading in sentence case, without the all-caps transform', () => {
    render(<OrderStatusClient initialOrder={readyOrder({ customer_name: 'Lucía Pérez' })} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/^Ready, Lucía!$/)
    expect(heading).not.toHaveClass('uppercase')
    expect(heading).toHaveClass('text-display')
  })

  it('falls back to "Ready!" without a name', () => {
    render(<OrderStatusClient initialOrder={readyOrder({ customer_name: '  ' })} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Ready!$/)
  })

  it('hides "Notify me" and sits above the tab bar once ready', () => {
    render(<OrderStatusClient initialOrder={readyOrder()} />)
    expect(screen.queryByText('Notify me when it is ready')).not.toBeInTheDocument()
    // The customer tab bar is fixed at z-40; the takeover covers it.
    expect(screen.getByTestId('order-ready-screen')).toHaveClass('fixed', 'inset-0', 'z-50')
  })

  it('shows a single "+1 stamp" with the real card count for signed-in customers', () => {
    render(
      <OrderStatusClient
        initialOrder={readyOrder({
          customer_id: 'cust-1',
          loyalty: { shop_id: 'shop-1', shop_name: 'X', shop_slug: 'x', stamps: 6, stamps_required: 8, reward_text: null, can_redeem: false } as never,
        })}
      />
    )
    expect(screen.getAllByText('+1 stamp')).toHaveLength(1)
    expect(screen.getByText('6 of 8')).toBeInTheDocument()
    expect(screen.getByTestId('ready-stamp').querySelectorAll('[data-new="true"]')).toHaveLength(1)
    expect(screen.getByTestId('ready-stamp').innerHTML).not.toMatch(/scale-125/)
    expect(screen.queryByTestId('ready-guest-invite')).not.toBeInTheDocument()
  })

  it('invites guests to create an account instead of promising a stamp', () => {
    render(<OrderStatusClient initialOrder={readyOrder()} />)
    expect(screen.queryByText('+1 stamp')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/account/signup')
  })

  it('shows the order details in a cell directly below the upsell', () => {
    const { container } = render(<OrderStatusClient initialOrder={readyOrder()} />)
    const details = screen.getByTestId('ready-details')
    expect(details).toHaveClass('mt-3', 'rounded-2xl')
    expect(screen.queryByText('1 × Cortado')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View order details' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /1 item/ }))
    expect(screen.getByText('1 × Cortado')).toBeInTheDocument()
    expect(screen.getByText('Leche de avena')).toBeInTheDocument()
    expect(container.querySelector('[class*="code-in"]')).not.toBeInTheDocument()
  })

  it('opens the full-screen code for the bar when the code is tapped, and Back closes it', () => {
    render(<OrderStatusClient initialOrder={readyOrder()} />)
    expect(screen.queryByTestId('bar-handoff')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('open-bar-handoff'))
    expect(screen.getByTestId('bar-handoff')).toBeInTheDocument()
    expect(screen.getByTestId('bar-pickup-code')).toHaveTextContent(screen.getByTestId('ready-pickup-code').textContent ?? '')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.queryByTestId('bar-handoff')).not.toBeInTheDocument()
  })

  it('keeps the regular tracker before the order is ready', () => {
    render(<OrderStatusClient initialOrder={readyOrder({ status: 'preparing' })} />)
    expect(screen.queryByTestId('order-ready-screen')).not.toBeInTheDocument()
  })
})

describe('readyFirstName', () => {
  it('uses the first word only', () => {
    expect(readyFirstName(' Ana María ')).toBe('Ana')
    expect(readyFirstName(null)).toBeNull()
    expect(readyFirstName('')).toBeNull()
  })
})
