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
 * "Enséñalo en la barra" (mock b3): the pickup code at 108px with the customer's
 * name and items, readable from a metre away. Keeps the screen on with the Screen
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
      ? 'La pantalla no se apaga mientras esté abierta. Se lee a un metro.'
      : 'Se lee a un metro. Si se apaga la pantalla, tócala para volver.'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enséñalo en la barra"
      className="fixed inset-0 z-[60] overflow-y-auto bg-sky text-foreground motion-safe:animate-[fade-in_160ms_ease-out]"
      data-testid="bar-handoff"
      data-wake-lock={wakeLock}
    >
      <div className="mx-auto flex min-h-full max-w-xl flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+84px)] pt-[env(safe-area-inset-top)]">
        <div className="flex h-12 items-center text-body-sm font-semibold">
          <span className="truncate">{shopName}</span>
        </div>

        {/* Between the header and Volver, at the optical centre: one third of the free space above, two below. */}
        <div className="flex flex-1 flex-col" data-testid="bar-handoff-group">
          <span className="min-h-6 flex-1" aria-hidden="true" />
          <p className="text-center text-eyebrow uppercase text-listo-muted">Enséñalo en la barra</p>
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
          className="mx-auto flex h-12 w-full max-w-xl items-center justify-center rounded-full border-[1.5px] border-foreground/28 bg-sky-tint/55 text-button text-foreground active:scale-[0.98]"
        >
          Volver
        </button>
      </div>
    </div>
  )
}
