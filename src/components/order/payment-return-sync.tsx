'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { syncPayment } from '@/server/actions/payments'

export function PaymentReturnSync({
  orderId,
  accessToken,
}: {
  orderId: string
  accessToken?: string
}) {
  const router = useRouter()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const key = `payment-sync-${orderId}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    syncPayment(orderId, accessToken)
      .then(() => router.refresh())
      .catch(() => router.refresh())
  }, [accessToken, orderId, router])

  return null
}
