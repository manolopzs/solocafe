'use client'

import { useCallback, useSyncExternalStore } from 'react'

export interface StoredCartLine {
  itemId: string
  quantity: number
  modifierIds: string[]
}

interface CartBucket {
  lines: StoredCartLine[]
  listeners: Set<() => void>
  appliedSeed: string | null
}

const buckets = new Map<string, CartBucket>()
const emptyLines: StoredCartLine[] = []

function storageKey(shopId: string) {
  return `solocafe.cart.${shopId}`
}

function isLine(value: unknown): value is StoredCartLine {
  if (!value || typeof value !== 'object') return false
  const line = value as StoredCartLine
  return typeof line.itemId === 'string' && typeof line.quantity === 'number' && Array.isArray(line.modifierIds)
}

function signature(ids: string[]) {
  return ids.slice().sort().join(',')
}

function readStored(shopId: string): StoredCartLine[] {
  if (typeof window === 'undefined') return emptyLines
  try {
    const raw = window.localStorage.getItem(storageKey(shopId))
    if (!raw) return emptyLines
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isLine) : emptyLines
  } catch {
    return emptyLines
  }
}

function bucket(shopId: string): CartBucket {
  let entry = buckets.get(shopId)
  if (!entry) {
    entry = { lines: readStored(shopId), listeners: new Set(), appliedSeed: null }
    buckets.set(shopId, entry)
  }
  return entry
}

function persist(shopId: string, lines: StoredCartLine[]) {
  const entry = bucket(shopId)
  entry.lines = lines
  try {
    window.localStorage.setItem(storageKey(shopId), JSON.stringify(lines))
  } catch {
    // Private mode can reject storage. The bag still works for this visit.
  }
  entry.listeners.forEach((listener) => listener())
}

function seedKeyFor(lines: StoredCartLine[]) {
  return lines.map((line) => `${line.itemId}:${line.quantity}:${signature(line.modifierIds)}`).join('|')
}

export function useShopCart(shopId: string, seed: StoredCartLine[] | null = null) {
  const seedKey = seed && seed.length > 0 ? seedKeyFor(seed) : null
  const lines = useSyncExternalStore(
    (listener) => {
      const entry = bucket(shopId)
      entry.listeners.add(listener)
      return () => {
        entry.listeners.delete(listener)
      }
    },
    () => {
      const entry = bucket(shopId)
      if (seedKey && seed && entry.appliedSeed !== seedKey) {
        entry.appliedSeed = seedKey
        entry.lines = seed
        try {
          window.localStorage.setItem(storageKey(shopId), JSON.stringify(seed))
        } catch {
          // Keep the seeded bag in memory when storage is unavailable.
        }
      }
      return entry.lines
    },
    () => (seed && seed.length > 0 ? seed : emptyLines)
  )

  const add = useCallback(
    (itemId: string, quantity: number, modifierIds: string[]) => {
      const prev = bucket(shopId).lines
      const nextSignature = signature(modifierIds)
      const index = prev.findIndex(
        (line) => line.itemId === itemId && signature(line.modifierIds) === nextSignature
      )
      const next =
        index === -1
          ? [...prev, { itemId, quantity, modifierIds }]
          : prev.map((line, i) => (i === index ? { ...line, quantity: line.quantity + quantity } : line))
      persist(shopId, next)
    },
    [shopId]
  )

  const setQuantity = useCallback(
    (index: number, quantity: number) => {
      const next = bucket(shopId).lines
        .map((line, i) => (i === index ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0)
      persist(shopId, next)
    },
    [shopId]
  )

  const remove = useCallback(
    (index: number) => {
      persist(
        shopId,
        bucket(shopId).lines.filter((_, i) => i !== index)
      )
    },
    [shopId]
  )

  const replace = useCallback(
    (next: StoredCartLine[]) => {
      persist(shopId, next)
    },
    [shopId]
  )

  return { lines, add, setQuantity, remove, replace }
}
