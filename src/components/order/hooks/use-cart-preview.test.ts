/** @jest-environment jsdom */

import { act, renderHook, waitFor } from '@testing-library/react'
import { useCartPreview } from './use-cart-preview'
import { previewPublicCart } from '@/server/actions/orders'
import type { CartPreview } from '@/types'
import type { StoredCartLine } from './use-shop-cart'

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

  it('drops the old quote as soon as the bag changes (quick-add keeps total in sync)', async () => {
    // Bag already holds 2 Lattes at 2,00 € each, quoted at 4,00 €.
    mockedPreview.mockResolvedValueOnce(makePreview({ subtotal_cents: 400, total_cents: 400 }))
    // The quote for the quick-added third Latte is still in flight.
    let resolveNext: (value: CartPreview) => void = () => {}
    mockedPreview.mockImplementationOnce(
      () => new Promise<CartPreview>((resolve) => {
        resolveNext = resolve
      })
    )

    const twoLattes: StoredCartLine[] = [{ itemId: 'latte', quantity: 2, modifierIds: [] }]
    const threeLattes: StoredCartLine[] = [{ itemId: 'latte', quantity: 3, modifierIds: [] }]
    const { result, rerender } = renderHook(
      ({ lines }: { lines: StoredCartLine[] }) => useCartPreview('shop-4', lines, 'asap', true),
      { initialProps: { lines: twoLattes } }
    )

    await waitFor(() => expect(result.current.preview?.total_cents).toBe(400))

    rerender({ lines: threeLattes })

    // Before the fix this still returned the 4,00 € quote for 2 items.
    expect(result.current.preview).toBeNull()

    await waitFor(() => expect(mockedPreview).toHaveBeenCalledTimes(2))
    await act(async () => {
      resolveNext(makePreview({ subtotal_cents: 600, total_cents: 600 }))
    })
    await waitFor(() => expect(result.current.preview?.total_cents).toBe(600))
  })
})
