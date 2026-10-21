import { Icon } from '@/components/ui/icon'

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  decreaseLabel = 'Disminuir',
  increaseLabel = 'Aumentar',
}: {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  decreaseLabel?: string
  increaseLabel?: string
}) {
  return (
    <div className="inline-flex items-center rounded-full bg-surface p-1">
      <button
        type="button"
        onClick={onDecrease}
        className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background"
        aria-label={decreaseLabel}
      >
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span className="w-7 text-center text-base font-medium tabular-nums text-foreground">{value}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background"
        aria-label={increaseLabel}
      >
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  )
}
