import { Icon } from '@/components/ui/icon'

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  decreaseLabel = 'Disminuir',
  increaseLabel = 'Aumentar',
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
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-pill p-1">
      <button
        type="button"
        onClick={removeAtOne && value <= 1 ? removeAtOne.onRemove : onDecrease}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-foreground shadow-xs after:absolute after:-inset-1 active:scale-90"
        aria-label={removeAtOne && value <= 1 ? removeAtOne.label : decreaseLabel}
      >
        <Icon name={removeAtOne && value <= 1 ? 'trash' : 'minus'} className="h-4 w-4" />
      </button>
      <span className="min-w-6 text-center text-base font-semibold tabular-nums text-foreground">{value}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-foreground shadow-xs after:absolute after:-inset-1 active:scale-90"
        aria-label={increaseLabel}
      >
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  )
}
