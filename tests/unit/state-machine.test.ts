import { stateMachine } from '@/server/actions/kds'
import type { OrderStatus } from '@/types'

describe('order state machine', () => {
  it('allows the expected happy path', () => {
    expect(stateMachine.received).toContain('preparing')
    expect(stateMachine.preparing).toContain('ready')
    expect(stateMachine.ready).toContain('picked_up')
  })

  it('allows cancellation from received or preparing', () => {
    expect(stateMachine.received).toContain('cancelled')
    expect(stateMachine.preparing).toContain('cancelled')
  })

  it('blocks invalid transitions', () => {
    expect(stateMachine.received).not.toContain('ready')
    expect(stateMachine.ready).not.toContain('preparing')
    expect(stateMachine.picked_up).toHaveLength(0)
    expect(stateMachine.cancelled).toHaveLength(0)
  })

  it('covers every status', () => {
    const statuses: OrderStatus[] = ['received', 'preparing', 'ready', 'picked_up', 'cancelled']
    for (const status of statuses) {
      expect(stateMachine[status]).toBeDefined()
    }
  })
})
