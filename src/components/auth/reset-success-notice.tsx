'use client'

import { useSearchParams } from 'next/navigation'
import { Notice } from '@/components/ui/notice'
import { RESET_SUCCESS_MESSAGE } from '@/lib/auth-flow'

/** Render inside <Suspense>: it reads ?reset=success from the URL. */
export function ResetSuccessNotice() {
  const searchParams = useSearchParams()
  // null outside the app router (e.g. isolated renders in tests).
  if (searchParams?.get('reset') !== 'success') return null
  return <Notice tone="success">{RESET_SUCCESS_MESSAGE}</Notice>
}
