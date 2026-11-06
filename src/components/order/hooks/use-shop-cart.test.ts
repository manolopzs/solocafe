/** @jest-environment jsdom */

import { renderHook, act } from '@testing-library/react'
import { useShopCart, CART_TTL_MS, type StoredCartLine } from './use-shop-cart'

function mockStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: () => {
      store = {}
    },
    _store: () => store,
  }
}

describe('useShopCart', () => {
  let storage: ReturnType<typeof mockStorage>
  let shopIdCounter = 0

  beforeEach(() => {
    shopIdCounter += 1
    storage = mockStorage()
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
    })
  })

  it('adds lines and persists them with a savedAt timestamp', () => {
    const shopId = `shop-${shopIdCounter}`
    const { result } = renderHook(() => useShopCart(shopId))

    act(() => {
      result.current.add('item-1', 2, [])
    })

    expect(result.current.lines).toHaveLength(1)
    expect(result.current.lines[0]).toEqual({ itemId: 'item-1', quantity: 2, modifierIds: [] })

    const raw = storage._store()[`solocafe.cart.${shopId}`]
    const parsed = JSON.parse(raw)
    expect(parsed.lines).toEqual(result.current.lines)
    expect(typeof parsed.savedAt).toBe('number')
  })

  it('merges quantities for identical items', () => {
    const shopId = `shop-${shopIdCounter}`
    const { result } = renderHook(() => useShopCart(shopId))

    act(() => result.current.add('item-1', 1, []))
    act(() => result.current.add('item-1', 2, []))

    expect(result.current.lines[0].quantity).toBe(3)
  })

  it('removes a line by index', () => {
    const shopId = `shop-${shopIdCounter}`
    const { result } = renderHook(() => useShopCart(shopId))

    act(() => result.current.add('item-1', 1, []))
    act(() => result.current.add('item-2', 1, []))
    act(() => result.current.remove(0))

    expect(result.current.lines).toHaveLength(1)
    expect(result.current.lines[0].itemId).toBe('item-2')
  })

  it('clears all lines', () => {
    const shopId = `shop-${shopIdCounter}`
    const { result } = renderHook(() => useShopCart(shopId))

    act(() => result.current.add('item-1', 1, []))
    act(() => result.current.clear())

    expect(result.current.lines).toHaveLength(0)
    const parsed = JSON.parse(storage._store()[`solocafe.cart.${shopId}`])
    expect(parsed.lines).toEqual([])
  })

  it('discards stale carts older than the TTL', () => {
    const shopId = `shop-${shopIdCounter}`
    const stale: StoredCartLine[] = [{ itemId: 'old', quantity: 1, modifierIds: [] }]
    storage.setItem(
      `solocafe.cart.${shopId}`,
      JSON.stringify({ lines: stale, savedAt: Date.now() - CART_TTL_MS - 1000 })
    )

    const { result } = renderHook(() => useShopCart(shopId))
    expect(result.current.lines).toHaveLength(0)
  })

  it('migrates legacy array-only stored carts', () => {
    const shopId = `shop-${shopIdCounter}`
    const legacy: StoredCartLine[] = [{ itemId: 'legacy', quantity: 1, modifierIds: [] }]
    storage.setItem(`solocafe.cart.${shopId}`, JSON.stringify(legacy))

    const { result } = renderHook(() => useShopCart(shopId))
    expect(result.current.lines).toEqual(legacy)
  })
})
