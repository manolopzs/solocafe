import type { Order } from '@/types'
import type { GuestOrder } from '@/lib/guest-orders'
import { lastCustomerOrder, lastGuestOrder } from './last-order'

const guest = (over: Partial<GuestOrder> = {}): GuestOrder => ({
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
  ...over,
})

const order = (over: Partial<Order> = {}): Order =>
  ({
    id: 'o1',
    shop_slug: 'solo-cafe',
    shop_name: 'Solo cafe',
    status: 'picked_up',
    total_cents: 350,
    currency: 'EUR',
    created_at: '2026-11-10T10:00:00Z',
    items: [{ id: 'i1', order_id: 'o1', item_id: 'm1', item_name_snapshot: 'Cafe con leche', unit_price_cents: 175, quantity: 2, subtotal_cents: 350 }],
    ...over,
  }) as Order

describe('lastGuestOrder', () => {
  it('is null when this phone has no orders', () => {
    expect(lastGuestOrder([])).toBeNull()
  })

  it('uses the newest repeatable order and the Pedidos repeat link', () => {
    const last = lastGuestOrder([guest()])
    expect(last).toMatchObject({
      shopName: 'Solo cafe',
      itemsSummary: '1 × Latte',
      reorderHref: '/solo-cafe?reorder=g1&token=tok',
      cutout: '/menu/cutouts/latte.png',
      etaMinutes: null,
    })
  })

  it('shows a time only when the order carried one', () => {
    expect(lastGuestOrder([guest({ estimatedReadyMinutes: 15 })])?.etaMinutes).toBe(15)
    expect(lastGuestOrder([guest({ estimatedReadyMinutes: 0 })])?.etaMinutes).toBeNull()
  })

  it('skips cancelled orders, orders without a shop and old orders without items', () => {
    expect(lastGuestOrder([guest({ status: 'cancelled' })])).toBeNull()
    expect(lastGuestOrder([guest({ shopSlug: null })])).toBeNull()
    expect(lastGuestOrder([guest({ itemsSummary: undefined })])).toBeNull()
    expect(lastGuestOrder([guest({ id: 'x', status: 'cancelled' }), guest({ id: 'y' })])?.id).toBe('y')
  })
})

describe('lastCustomerOrder', () => {
  it('is null without orders', () => {
    expect(lastCustomerOrder([])).toBeNull()
  })

  it('picks the newest order and links to the signed-in repeat', () => {
    const last = lastCustomerOrder([
      order({ id: 'old', created_at: '2026-11-01T10:00:00Z' }),
      order({ id: 'new', created_at: '2026-11-12T10:00:00Z', estimated_ready_minutes: 12 }),
    ])
    expect(last).toMatchObject({
      id: 'new',
      reorderHref: '/solo-cafe?reorder=new',
      itemsSummary: '2 × Café con leche',
      etaMinutes: 12,
      cutout: '/menu/cutouts/cafe-con-leche.png',
    })
  })

  it('skips orders it cannot repeat', () => {
    expect(lastCustomerOrder([order({ status: 'pending_payment' })])).toBeNull()
    expect(lastCustomerOrder([order({ shop_slug: undefined })])).toBeNull()
    expect(lastCustomerOrder([order({ items: [] })])).toBeNull()
  })
})
