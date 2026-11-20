'use client'

import { useEffect } from 'react'
import { guestOrderFromOrder, rememberGuestOrder } from '@/lib/guest-orders'
import type { Order } from '@/types'

/** Saves the order on this phone so the Orders tab can show it without an account. */
export function RememberGuestOrder({ order, token }: { order: Order; token: string }) {
  const entry = guestOrderFromOrder(order, token)
  const key = JSON.stringify(entry)

  useEffect(() => {
    rememberGuestOrder(JSON.parse(key) as ReturnType<typeof guestOrderFromOrder>)
  }, [key])

  return null
}
