'use client'

import { useEffect, useRef, useState } from 'react'
import { previewPublicCart } from '@/server/actions/orders'
import { orderErrorCopy } from '@/lib/ordering'
import type { CartPreview } from '@/types'
import type { StoredCartLine } from './use-shop-cart'

const PREVIEW_TIMEOUT_MS = 8000
const MAX_RETRIES = 2

export function useCartPreview(
  shopId: string,
  lines: StoredCartLine[],
  pickupType: 'asap' | 'scheduled',
  enabled: boolean,
  redeemLoyalty = false
) {
  // Keep the request key with the quote so a quote for an older bag is never
  // shown next to the current lines (e.g. right after a quick-add).
  const [quote, setQuote] = useState<{ key: string; data: CartPreview } | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const lineKey = JSON.stringify(lines)
  const requestKey = `${shopId}|${pickupType}|${lineKey}|${redeemLoyalty ? 'redeem' : 'keep'}`
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      return
    }

    let cancelled = false

    const run = async () => {
      if (cancelled) return

      // Defer state updates so the effect body stays sync-clean for lint.
      await Promise.resolve()
      if (cancelled) return
      setLoading(true)
      setError(null)

      let timeoutId: ReturnType<typeof setTimeout> | undefined
      try {
        const data = await Promise.race([
          previewPublicCart({
            shopId,
            pickupType,
            redeemLoyalty,
            items: lines.map((line) => ({
              menu_item_id: line.itemId,
              quantity: line.quantity,
              modifier_option_ids: line.modifierIds,
            })),
          }),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('timeout')), PREVIEW_TIMEOUT_MS)
          }),
        ])

        if (cancelled) return
        setQuote({ key: requestKey, data })
        setRetryAttempt(0)
        setError(null)
      } catch (err) {
        if (cancelled) return

        if (retryAttempt < MAX_RETRIES) {
          retryTimeoutRef.current = setTimeout(() => {
            setRetryAttempt((previous) => previous + 1)
          }, 1000 * (retryAttempt + 1))
          return
        }

        const message = err instanceof Error ? err.message : ''
        setQuote(null)
        setError(orderErrorCopy(message) || 'No pudimos revisar tu pedido. Toca para reintentar.')
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    const interval = setInterval(() => {
      if (!cancelled) {
        setRetryAttempt(0)
        void run()
      }
    }, 15000)

    return () => {
      cancelled = true
      clearInterval(interval)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [enabled, requestKey, retryAttempt, refreshNonce, shopId, lines, pickupType, redeemLoyalty])

  const refresh = () => {
    setError(null)
    setRetryAttempt(0)
    setRefreshNonce((n) => n + 1)
  }

  if (!enabled) return { preview: null, loyalty: null, loading: false, error: null, refresh }
  const preview = quote?.key === requestKey ? quote.data : null
  return {
    preview,
    loyalty: preview?.loyalty ?? null,
    loading,
    error,
    refresh,
  }
}
