/** @jest-environment jsdom */
import type { Order } from '@/types'

type GuestOrdersModule = typeof import('./guest-orders')

function freshModule(): GuestOrdersModule {
  let mod: GuestOrdersModule | undefined
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- fresh module per test to re-read localStorage
    mod = require('./guest-orders') as GuestOrdersModule
  })
  return mod!
}

const entry = (id: string, createdAt: string, status: Order['status'] = 'received') => ({
  id,
  token: `tok-${id}`,
  shopSlug: 'main',
  shopName: 'Solo cafe',
  status,
  totalCents: 200,
  currency: 'EUR',
  itemCount: 1,
  createdAt,
})

describe('guest orders store', () => {
  beforeEach(() => window.localStorage.clear())

  it('saves orders newest first and keeps at most 10', () => {
    const store = freshModule()
    for (let i = 0; i < 12; i += 1) {
      store.rememberGuestOrder(entry(`o${i}`, new Date(Date.UTC(2026, 10, 16, 9, i)).toISOString()))
    }
    const saved = store.getGuestOrdersSnapshot()
    expect(saved).toHaveLength(store.MAX_GUEST_ORDERS)
    expect(saved[0].id).toBe('o11')
    expect(saved.map((o) => o.id)).not.toContain('o0')

    const reloaded = freshModule().getGuestOrdersSnapshot()
    expect(reloaded.map((o) => o.id)).toEqual(saved.map((o) => o.id))
  })

  it('updates an existing order instead of duplicating it', () => {
    const store = freshModule()
    store.rememberGuestOrder(entry('a', '2026-11-16T09:00:00Z', 'received'))
    store.rememberGuestOrder(entry('a', '2026-11-16T09:00:00Z', 'ready'))
    expect(store.getGuestOrdersSnapshot()).toEqual([entry('a', '2026-11-16T09:00:00Z', 'ready')])
  })

  it('ignores corrupt storage', () => {
    window.localStorage.setItem('solo-cafe.guest-orders', '{not json')
    expect(freshModule().getGuestOrdersSnapshot()).toEqual([])
    window.localStorage.setItem('solo-cafe.guest-orders', JSON.stringify([{ id: 'x' }, entry('b', '2026-11-16T09:00:00Z')]))
    expect(freshModule().getGuestOrdersSnapshot().map((o) => o.id)).toEqual(['b'])
  })

  it('applies refreshed statuses', () => {
    const store = freshModule()
    store.rememberGuestOrder(entry('a', '2026-11-16T09:00:00Z', 'preparing'))
    store.updateGuestOrderStatuses([{ id: 'a', status: 'picked_up' }, { id: 'zzz', status: 'ready' }])
    expect(store.getGuestOrdersSnapshot()[0].status).toBe('picked_up')
  })

  it('knows which orders are in progress and links to their status page', () => {
    const store = freshModule()
    expect(store.isActiveGuestOrder({ status: 'received' })).toBe(true)
    expect(store.isActiveGuestOrder({ status: 'ready' })).toBe(true)
    expect(store.isActiveGuestOrder({ status: 'picked_up' })).toBe(false)
    expect(store.isActiveGuestOrder({ status: 'pending_payment' })).toBe(false)
    expect(store.guestOrderHref({ id: 'abc', token: 't/1' })).toBe('/order/abc?token=t%2F1')
  })

  it('builds an entry from the public order payload', () => {
    const store = freshModule()
    const order = {
      id: 'abc',
      status: 'received',
      total_cents: 400,
      currency: 'EUR',
      item_count: 2,
      created_at: '2026-11-16T09:00:00Z',
      shop: { id: 's', name: 'Solo cafe', slug: 'main' },
    } as unknown as Order
    expect(store.guestOrderFromOrder(order, 'tok')).toEqual({
      id: 'abc',
      token: 'tok',
      shopSlug: 'main',
      shopName: 'Solo cafe',
      status: 'received',
      totalCents: 400,
      currency: 'EUR',
      itemCount: 2,
      createdAt: '2026-11-16T09:00:00Z',
    })
  })

  it('keeps the quoted ready time only when the order has one', () => {
    const store = freshModule()
    const base = { id: 'abc', status: 'received', total_cents: 400, currency: 'EUR', item_count: 1, created_at: '2026-11-16T09:00:00Z' }
    expect(store.guestOrderFromOrder({ ...base, estimated_ready_minutes: 15 } as unknown as Order, 'tok').estimatedReadyMinutes).toBe(15)
    expect(store.guestOrderFromOrder(base as unknown as Order, 'tok')).not.toHaveProperty('estimatedReadyMinutes')
  })

  it('keeps a short summary of the items when the payload has them', () => {
    const store = freshModule()
    const order = {
      id: 'abc',
      status: 'received',
      total_cents: 600,
      currency: 'EUR',
      created_at: '2026-11-16T09:00:00Z',
      shop: { id: 's', name: 'Solo cafe', slug: 'main' },
      items: [
        { item_id: 'i1', item_name_snapshot: 'Latte', quantity: 1 },
        { item_id: 'i2', item_name_snapshot: 'Cortado', quantity: 2 },
      ],
    } as unknown as Order
    const saved = store.guestOrderFromOrder(order, 'tok')
    expect(saved.itemsSummary).toBe('1 × Latte, 2 × Cortado')
    expect(saved.itemCount).toBe(3)
  })

  it('links Repetir to the shop with the order id and its token', () => {
    const store = freshModule()
    expect(store.guestReorderHref({ id: 'abc', token: 't/1', shopSlug: 'main' })).toBe('/main?reorder=abc&token=t%2F1')
    expect(store.guestReorderHref({ id: 'abc', token: 't', shopSlug: null })).toBeNull()
  })

  it('drops stored entries whose summary is not text', () => {
    window.localStorage.setItem(
      'solo-cafe.guest-orders',
      JSON.stringify([{ ...entry('ok', '2026-11-16T09:00:00Z'), itemsSummary: 7 }, entry('ok2', '2026-11-16T09:01:00Z')]),
    )
    expect(freshModule().getGuestOrdersSnapshot().map((o) => o.id)).toEqual(['ok2'])
  })
})
