'use client'

import { useEffect, useRef } from 'react'
import { pickupCode } from '@/lib/pickup-code'
import { useWakeLock } from '@/lib/use-wake-lock'

export interface BarHandoffItem {
  id: string
  quantity: number
  name: string
}

/**
 * "Show this at the counter" (mock b3): the pickup code at 108px with the customer's
 * name and items, readable from a meter away. Keeps the screen on with the Screen
 * Wake Lock when the browser allows it (a web page cannot raise the brightness).
 */
export function BarHandoff({
  orderId,
  shopName,
  customerName,
  items,
  onClose,
}: {
  orderId: string
  shopName: string | null | undefined
  customerName: string | null
  items: BarHandoffItem[]
  onClose: () => void
}) {
  const wakeLock = useWakeLock(true)
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    backRef.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const summary = items.map((item) => `${item.quantity} × ${item.name}`).join(', ')
  const hint =
    wakeLock === 'active'
      ? 'The screen stays on while this is open. It is readable from a meter away.'
      : 'It is readable from a meter away. If the screen goes off, tap it to wake.'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Show this at the counter"
      className="fixed inset-0 z-[60] overflow-y-auto bg-sky text-foreground motion-safe:animate-[fade-in_160ms_ease-out]"
      data-testid="bar-handoff"
      data-wake-lock={wakeLock}
    >
      <div className="phone-col flex min-h-full flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+84px)] pt-[env(safe-area-inset-top)]">
        <div className="flex h-12 items-center text-body-sm font-semibold">
          <span className="truncate">{shopName}</span>
        </div>

        {/* Between the header and Back, at the optical centre: one third of the free space above, two below. */}
        <div className="flex flex-1 flex-col" data-testid="bar-handoff-group">
          <span className="min-h-6 flex-1" aria-hidden="true" />
          <p className="text-center text-eyebrow uppercase text-listo-muted">Show this at the counter</p>
          <div className="mt-3 rounded-code bg-sky-tint/70 px-6 pb-9 pt-8 text-center">
            <p
              className="text-[108px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground"
              data-testid="bar-pickup-code"
            >
              {pickupCode(orderId)}
            </p>
            {customerName && <p className="mt-6 text-[28px] font-semibold leading-[34px] tracking-[-0.015em]">{customerName}</p>}
            {summary && <p className={[customerName ? 'mt-1' : 'mt-6', 'text-body text-listo-muted'].join(' ')}>{summary}</p>}
          </div>
          <p className="mx-auto mt-4 max-w-[30ch] text-center text-body-sm text-listo-muted [text-wrap:balance]">{hint}</p>
          <span className="min-h-6 flex-[2]" aria-hidden="true" />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+12px)] px-5">
        <button
          ref={backRef}
          type="button"
          onClick={onClose}
          className="phone-col flex h-12 w-full items-center justify-center rounded-full border-[1.5px] border-foreground/28 bg-sky-tint/55 text-button text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-sky"
        >
          Back
        </button>
      </div>
    </div>
  )
}
