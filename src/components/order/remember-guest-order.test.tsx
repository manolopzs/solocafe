/** @jest-environment jsdom */
import { render } from '@testing-library/react'
import type { Order } from '@/types'
import { RememberGuestOrder } from './remember-guest-order'

describe('RememberGuestOrder', () => {
  it('saves the order on this phone when its status page loads', () => {
    const order = {
      id: '33333333-3333-4333-8333-333333333333',
      status: 'received',
      total_cents: 200,
      currency: 'EUR',
      item_count: 1,
      created_at: '2026-11-16T12:00:00Z',
      shop: { id: 's', name: 'Solo cafe', slug: 'main', locale: 'es' },
    } as unknown as Order
    render(<RememberGuestOrder order={order} token="guest-token" />)
    const saved = JSON.parse(window.localStorage.getItem('solo-cafe.guest-orders') ?? '[]')
    expect(saved).toEqual([
      expect.objectContaining({ id: order.id, token: 'guest-token', shopSlug: 'main', status: 'received' }),
    ])
  })
})
