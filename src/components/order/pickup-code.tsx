import { pickupCode } from '@/lib/pickup-code'

/**
 * The one pickup-code component (foundation/SPEC.md section 9). Same digits,
 * tracking and eyebrow in both sizes:
 * - md (tracker): left-aligned sky chip, 64 high, code at 48/48.
 * - lg (Ready): centred in a sky-tint card (radius 28), code at 88/88 with a hint.
 */
export function PickupCode({
  orderId,
  size,
  eyebrow = size === 'lg' ? 'Your code' : 'Pickup code',
  hint = size === 'lg' ? 'Say it or show this at the counter' : undefined,
  className = '',
}: {
  orderId: string
  size: 'md' | 'lg'
  eyebrow?: string
  hint?: string
  className?: string
}) {
  const code = pickupCode(orderId)

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
    <div className={['rounded-code bg-sky-tint px-6 pb-5 pt-6 text-center', className].join(' ')}>
      <p className="text-eyebrow uppercase text-listo-muted">{eyebrow}</p>
      <p
        className="mt-2 text-code-lg tabular-nums text-listo-code"
        data-testid="ready-pickup-code"
      >
        {code}
      </p>
      {hint && <p className="mt-2 text-body-sm text-listo-muted">{hint}</p>}
    </div>
  )
}
