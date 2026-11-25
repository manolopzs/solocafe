import { PhosphorIcon } from '@/components/icons/phosphor'
import { vibrate } from '@/lib/vibrate'

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  decreaseLabel = 'Decrease',
  increaseLabel = 'Increase',
  removeAtOne,
}: {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  decreaseLabel?: string
  increaseLabel?: string
  /** At quantity 1 the minus becomes a bin that removes the line. */
  removeAtOne?: { label: string; onRemove: () => void }
}) {
  const handleDecrease = () => {
    vibrate(10)
    if (removeAtOne && value <= 1) removeAtOne.onRemove()
    else onDecrease()
  }

  const handleIncrease = () => {
    vibrate(10)
    onIncrease()
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-pill p-1">
      <button
        type="button"
        onClick={handleDecrease}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-foreground shadow-xs after:absolute after:-inset-1 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-pill"
        aria-label={removeAtOne && value <= 1 ? removeAtOne.label : decreaseLabel}
      >
        {removeAtOne && value <= 1 ? (
          <PhosphorIcon name="trash" className="h-4 w-4" />
        ) : (
          <PhosphorIcon name="minus" className="h-4 w-4" />
        )}
      </button>
      <span className="min-w-6 text-center text-base font-semibold tabular-nums text-foreground">{value}</span>
      <button
        type="button"
        onClick={handleIncrease}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-foreground shadow-xs after:absolute after:-inset-1 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-pill"
        aria-label={increaseLabel}
      >
        <PhosphorIcon name="plus" className="h-4 w-4" />
      </button>
    </div>
  )
}
