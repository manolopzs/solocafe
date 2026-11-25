import { groupOrdersByDate, isActiveOrder, partitionOrders } from './order-groups'

const todayIso = new Date().toISOString()
const yesterdayIso = new Date(Date.now() - 86400000).toISOString()
const olderIso = new Date(Date.now() - 86400000 * 3).toISOString()

describe('isActiveOrder', () => {
  it('returns true for received, preparing, ready and pending_payment', () => {
    expect(isActiveOrder({ status: 'received' })).toBe(true)
    expect(isActiveOrder({ status: 'preparing' })).toBe(true)
    expect(isActiveOrder({ status: 'ready' })).toBe(true)
    expect(isActiveOrder({ status: 'pending_payment' })).toBe(true)
  })

  it('returns false for picked_up and cancelled', () => {
    expect(isActiveOrder({ status: 'picked_up' })).toBe(false)
    expect(isActiveOrder({ status: 'cancelled' })).toBe(false)
  })
})

describe('partitionOrders', () => {
  it('splits active and past orders', () => {
    const orders = [
      { id: '1', status: 'received', created_at: todayIso },
      { id: '2', status: 'picked_up', created_at: todayIso },
      { id: '3', status: 'preparing', created_at: todayIso },
    ] as const
    const { active, past } = partitionOrders(orders as never)
    expect(active.map((o) => o.id)).toEqual(['1', '3'])
    expect(past.map((o) => o.id)).toEqual(['2'])
  })
})

describe('groupOrdersByDate', () => {
  it('groups by Today, Yesterday and date', () => {
    const orders = [
      { id: 'a', status: 'received', created_at: todayIso },
      { id: 'b', status: 'preparing', created_at: todayIso },
      { id: 'c', status: 'picked_up', created_at: yesterdayIso },
      { id: 'd', status: 'picked_up', created_at: olderIso },
    ] as const
    const groups = groupOrdersByDate(orders as never)
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday', expect.stringMatching(/^\d/)])
    expect(groups[0].items.map((o) => o.id)).toEqual(['a', 'b'])
    expect(groups[1].items.map((o) => o.id)).toEqual(['c'])
  })

  it('accepts guest orders with createdAt camelCase', () => {
    const orders = [
      { id: 'g1', status: 'received', createdAt: todayIso },
      { id: 'g2', status: 'picked_up', createdAt: yesterdayIso },
    ] as const
    const groups = groupOrdersByDate(orders as never)
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday'])
  })
})
