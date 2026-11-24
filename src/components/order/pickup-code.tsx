'use client'

import { useState } from 'react'
import { pickupCode } from '@/lib/pickup-code'
import { vibrate } from '@/lib/vibrate'

/**
 * The one pickup-code component (foundation/SPEC.md section 9). Same digits,
 * tracking and eyebrow in both sizes:
 * - md (tracker): left-aligned sky chip, 64 high, code at 48/48.
 * - lg (Ready): centred in a sky-tint card (radius 24), code at 64-72/1.0 with hint.
 */
export function PickupCode({
  orderId,
  size,
  eyebrow = size === 'lg' ? 'Your code' : 'Pickup code',
  hint = size === 'lg' ? 'Say it, or tap to show this at the counter' : undefined,
  onTap,
  'data-testid': dataTestId,
  className = '',
}: {
  orderId: string
  size: 'md' | 'lg'
  eyebrow?: string
  hint?: string
  onTap?: () => void
  'data-testid'?: string
  className?: string
}) {
  const code = pickupCode(orderId)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      vibrate(10)
      setCopied(true)
      onTap?.()
      const timer = setTimeout(() => setCopied(false), 1200)
      return () => clearTimeout(timer)
    } catch {
      // Ignore unsupported environments.
      onTap?.()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      void copy()
    }
  }

  if (size === 'md') {
    return (
      <div className={className}>
        <p className="text-eyebrow uppercase text-on-pill">{eyebrow}</p>
        <p
          className="mt-2 inline-flex h-16 items-center rounded-[18px] bg-sky px-[18px] text-code-md tabular-nums text-foreground"
          data-testid="pickup-code"
        >
          {code}
        </p>
      </div>
    )
  }

  return (
    <div className={['relative rounded-3xl bg-sky-tint px-6 pb-5 pt-6 text-center', className].join(' ')}>
      <button
        type="button"
        onClick={() => void copy()}
        onKeyDown={handleKeyDown}
        className="block w-full rounded-2xl transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-sky-tint active:scale-[0.98] animate-code-enter motion-reduce:animate-none"
        aria-label={`Pickup code ${code}. Tap to copy.`}
        data-testid={dataTestId}
      >
        <p className="text-eyebrow uppercase text-listo-muted">{eyebrow}</p>
        <p
          className="mt-2 text-[64px] font-semibold leading-[72px] tracking-[0.06em] tabular-nums text-listo-code"
          data-testid="ready-pickup-code"
        >
          {code}
        </p>
        {hint && <p className="mt-2 text-body-sm text-listo-muted">{hint}</p>}
      </button>
      {copied && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-md animate-toast-rise motion-reduce:animate-none">
          Copied
        </span>
      )}
    </div>
  )
}
