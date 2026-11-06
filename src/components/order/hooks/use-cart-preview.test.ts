/** @jest-environment jsdom */

import { renderHook, waitFor } from '@testing-library/react'
import { useCartPreview } from './use-cart-preview'
import { previewPublicCart } from '@/server/actions/orders'

jest.setTimeout(10000)

jest.mock('@/server/actions/orders', () => ({
  previewPublicCart: jest.fn(),
}))

const mockedPreview = previewPublicCart as jest.MockedFunction<typeof previewPublicCart>

function makePreview(overrides = {}) {
  return {
    ordering: {
      open_now: true,
      accepting_pickup: true,
      asap_available: true,
      status: 'open' as const,
      today: { is_open: true, open: '08:00', close: '20:00' },
    },
    estimated_ready_minutes: 10,
    pickup_window_starts_at: '2026-10-30T10:00:00Z',
    pickup_window_ends_at: '2026-10-30T10:15:00Z',
    subtotal_cents: 100,
    tax_cents: 0,
    total_cents: 100,
    currency: 'EUR',
    lines: [],
    can_checkout: true,
    checkout_blocked_reason: null,
    ...overrides,
  }
}

describe('useCartPreview', () => {
  beforeEach(() => {
    mockedPreview.mockReset()
  })

  it('returns preview data after a successful fetch', async () => {
    mockedPreview.mockResolvedValueOnce(makePreview())

    const { result } = renderHook(() => useCartPreview('shop-1', [], 'asap', true))

    await waitFor(() => expect(result.current.preview).not.toBeNull())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('surfaces an error after the request fails and retries are exhausted', async () => {
    mockedPreview.mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useCartPreview('shop-2', [], 'asap', true))

    await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 5000 })
    expect(result.current.preview).toBeNull()
  })

  it('exposes a refresh callback', () => {
    const { result } = renderHook(() => useCartPreview('shop-3', [], 'asap', true))
    expect(typeof result.current.refresh).toBe('function')
  })
})
