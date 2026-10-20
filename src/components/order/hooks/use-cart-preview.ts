'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api/client'
import type { CartPreview } from '@/types'
import type { StoredCartLine } from './use-shop-cart'

export function useCartPreview(
  shopId: string,
  lines: StoredCartLine[],
  pickupType: 'asap' | 'scheduled',
  enabled: boolean
) {
  const [preview, setPreview] = useState<CartPreview | null>(null)
  const [settledKey, setSettledKey] = useState<string | null>(null)
  const lineKey = JSON.stringify(lines)
  const requestKey = `${shopId}|${pickupType}|${lineKey}`

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    const run = async () => {
      try {
        const data = await api.post<CartPreview>(
          `/public/shops/${shopId}/cart/preview`,
          {
            pickup_type: pickupType,
            items: lines.map((line) => ({
              menu_item_id: line.itemId,
              quantity: line.quantity,
              modifier_option_ids: line.modifierIds,
            })),
          },
          false
        )
        if (cancelled) return
        setPreview(data)
        setSettledKey(requestKey)
      } catch {
        if (cancelled) return
        setPreview(null)
        setSettledKey(requestKey)
      }
    }

    void run()
    const interval = setInterval(() => void run(), 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [enabled, lineKey, lines, pickupType, requestKey, shopId])

  if (!enabled) return { preview: null, loading: false }
  const fresh = settledKey === requestKey
  return { preview: fresh ? preview : null, loading: !fresh }
}
