/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { OrderCard } from '@/components/kds/order-card'
import { OrderStatusClient } from '@/components/order/order-status-client'
import type { Order } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

jest.mock('@/server/queries/orders', () => ({
  getOrderWithItems: jest.fn(async () => null),
}))

jest.mock('@/lib/api/client', () => ({
  api: { patch: jest.fn() },
}))

const ORDER_ID = '3f6b2c1e-9a0d-4e5f-8b7c-4f2a9c1b7e3d'

const order = {
  id: ORDER_ID,
  shop_id: 'shop-1',
  status: 'received',
  customer_name: 'Lucía',
  customer_phone: null,
  pickup_type: 'asap',
  subtotal_cents: 200,
  total_cents: 200,
  created_at: new Date().toISOString(),
  allowed_transitions: ['preparing', 'cancelled'],
  items: [],
} as unknown as Order & { items: [] }

describe('pickup code on customer and Cocina screens', () => {
  it('shows the same code to the customer and the barista', () => {
    const customer = render(<OrderStatusClient initialOrder={order} />)
    expect(screen.getByText('Código de recogida')).toBeInTheDocument()
    expect(screen.getByTestId('pickup-code')).toHaveTextContent(/^7E3D$/)
    customer.unmount()

    render(<OrderCard order={order} items={[]} shopId="shop-1" onUpdated={() => {}} />)
    expect(screen.getByText('7E3D')).toBeInTheDocument()
    expect(screen.queryByText(/#/)).not.toBeInTheDocument()
  })

  it('no longer shows the old 6-character code on the customer screen', () => {
    render(<OrderStatusClient initialOrder={order} />)
    expect(screen.queryByText('1B7E3D')).not.toBeInTheDocument()
  })
})
