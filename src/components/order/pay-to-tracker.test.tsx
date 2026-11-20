/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import CheckoutSuccessPage from '@/app/checkout/[orderId]/success/page'
import { OrderStatusClient } from '@/components/order/order-status-client'
import type { Order } from '@/types'

const redirect = jest.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`)
})
const notFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

jest.mock('next/navigation', () => ({
  redirect: (url: string) => redirect(url),
  notFound: () => notFound(),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

jest.mock('@/server/queries/orders', () => ({
  getOrderWithItems: jest.fn(async () => null),
}))

const pendingOrder = {
  id: 'ord-1',
  shop_id: 'shop-1',
  status: 'pending_payment',
  customer_name: null,
  pickup_type: 'asap',
  subtotal_cents: 200,
  total_cents: 200,
  currency: 'eur',
  created_at: new Date().toISOString(),
  items: [],
} as unknown as Order & { items: [] }

describe('payment return goes to the tracker', () => {
  beforeEach(() => {
    redirect.mockClear()
    notFound.mockClear()
  })

  it('redirects the success URL to /order/<id> instead of showing "Payment confirmed"', async () => {
    await expect(
      CheckoutSuccessPage({
        params: Promise.resolve({ orderId: 'ord-1' }),
        searchParams: Promise.resolve({ token: 'tok', redirect_status: 'succeeded' }),
      })
    ).rejects.toThrow('NEXT_REDIRECT /order/ord-1?token=tok&pago=1')
  })

  it('carries the saved-card sync flag to the tracker', async () => {
    await expect(
      CheckoutSuccessPage({
        params: Promise.resolve({ orderId: 'ord-1' }),
        searchParams: Promise.resolve({ token: 'tok', sync: '1' }),
      })
    ).rejects.toThrow('NEXT_REDIRECT /order/ord-1?token=tok&pago=1&sync=1')
  })

  it('404s without an order token', async () => {
    await expect(
      CheckoutSuccessPage({ params: Promise.resolve({ orderId: 'ord-1' }), searchParams: Promise.resolve({}) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('says the payment is being confirmed while the webhook catches up', () => {
    render(<OrderStatusClient initialOrder={pendingOrder} accessToken="tok" paymentReturn />)
    expect(screen.getByRole('heading', { name: 'Confirming your payment' })).toBeInTheDocument()
    expect(screen.queryByText('Complete payment')).not.toBeInTheDocument()
    expect(screen.queryByText('Payment confirmed')).not.toBeInTheDocument()
  })

  it('still asks for payment when the customer did not just pay', () => {
    render(<OrderStatusClient initialOrder={pendingOrder} accessToken="tok" />)
    expect(screen.getByRole('heading', { name: 'Payment pending' })).toBeInTheDocument()
    expect(screen.getByText('Complete payment')).toBeInTheDocument()
  })
})
