import { KdsOfflineQueue } from './kds-offline-queue'
import type { Order } from '@/types'

describe('KdsOfflineQueue', () => {
  describe('isNetworkError', () => {
    it('treats TypeError as a network error', () => {
      expect(KdsOfflineQueue.isNetworkError(new TypeError('Failed to fetch'))).toBe(true)
    })

    it('detects network-related messages', () => {
      expect(KdsOfflineQueue.isNetworkError(new Error('Network error'))).toBe(true)
      expect(KdsOfflineQueue.isNetworkError(new Error('fetch failed'))).toBe(true)
      expect(KdsOfflineQueue.isNetworkError(new Error('The request was aborted'))).toBe(true)
    })

    it('does not treat a normal error as a network error', () => {
      expect(KdsOfflineQueue.isNetworkError(new Error('Something went wrong'))).toBe(false)
    })

    it('ignores non-error values', () => {
      expect(KdsOfflineQueue.isNetworkError(null)).toBe(false)
      expect(KdsOfflineQueue.isNetworkError('error')).toBe(false)
      expect(KdsOfflineQueue.isNetworkError(undefined)).toBe(false)
    })
  })

  describe('mergeOrderAfterSync', () => {
    it('prefers server values and keeps local items when server has none', () => {
      const local: Order = {
        id: 'order-1',
        shop_id: 'shop-1',
        customer_id: null,
        status: 'received',
        payment_status: 'succeeded',
        subtotal_cents: 1000,
        tax_cents: 100,
        tip_cents: 0,
        total_cents: 1100,
        currency: 'EUR',
        pickup_type: 'asap',
        pickup_time: null,
        customer_name: 'Ana',
        special_instructions: null,
        created_at: '2026-10-29T10:00:00Z',
        updated_at: '2026-10-29T10:00:00Z',
        items: [
          {
            id: 'item-1',
            order_id: 'order-1',
            item_id: 'menu-1',
            item_name_snapshot: 'Café',
            unit_price_cents: 1000,
            quantity: 1,
            subtotal_cents: 1000,
          },
        ],
      }

      const server: Order = {
        ...local,
        status: 'preparing',
        items: undefined,
        estimated_ready_minutes: 12,
      }

      const merged = KdsOfflineQueue.mergeOrderAfterSync(local, server)
      expect(merged.status).toBe('preparing')
      expect(merged.estimated_ready_minutes).toBe(12)
      expect(merged.items).toEqual(local.items)
    })

    it('returns server order when there is no local order', () => {
      const server: Order = {
        id: 'order-2',
        shop_id: 'shop-1',
        customer_id: null,
        status: 'ready',
        payment_status: 'succeeded',
        subtotal_cents: 500,
        tax_cents: 50,
        tip_cents: 0,
        total_cents: 550,
        currency: 'EUR',
        pickup_type: 'asap',
        pickup_time: null,
        customer_name: null,
        special_instructions: null,
        created_at: '2026-10-29T10:00:00Z',
        updated_at: '2026-10-29T10:00:00Z',
      }

      expect(KdsOfflineQueue.mergeOrderAfterSync(undefined, server)).toBe(server)
    })
  })
})
