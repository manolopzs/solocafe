/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
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

describe('pickup code on the customer order screen', () => {
  it('shows the 4-character pickup code', () => {
    render(<OrderStatusClient initialOrder={order} />)
    expect(screen.getByText('Código de recogida')).toBeInTheDocument()
    expect(screen.getByTestId('pickup-code')).toHaveTextContent(/^7E3D$/)
  })

  it('no longer shows the old 6-character code', () => {
    render(<OrderStatusClient initialOrder={order} />)
    expect(screen.queryByText('1B7E3D')).not.toBeInTheDocument()
  })
})
