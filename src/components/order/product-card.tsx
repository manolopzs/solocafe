'use client'

import { Icon } from '@/components/ui/icon'
import { MenuTileImage } from '@/components/order/menu-tile-image'
import { storefrontItemName } from '@/lib/storefront-menu'
import type { MenuItem } from '@/types'

/**
 * Menu grid item (mock 02): a 1:1 surface tile (radius 20) with the cut-out, the
 * "+" disc 8 from the tile corner, then name (16/22) and price (15/20) below.
 */
export function ProductCard({
  item,
  customizable,
  isFavorite,
  showFavorite,
  onClick,
  onQuickAdd,
  quantity = 0,
  onDecrement,
  onToggleFavorite,
  formatPrice,
  highlight,
}: {
  item: MenuItem
  customizable?: boolean
  isFavorite: boolean
  showFavorite: boolean
  onClick: () => void
  onQuickAdd?: () => void
  /** Units of this item (without options) already in the bag. */
  quantity?: number
  onDecrement?: () => void
  onToggleFavorite: () => void
  formatPrice: (cents: number) => string
  highlight?: boolean
}) {
  const displayName = storefrontItemName(item.name)

  return (
    <article className="group relative flex flex-col">
      <div
        className={[
          'relative aspect-square w-full overflow-hidden rounded-tile bg-surface transition-shadow',
          highlight ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : '',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={onClick}
          className="absolute inset-0 z-[1] touch-manipulation"
          aria-label={displayName}
        />
        <MenuTileImage item={item} sizes="(max-width: 640px) 50vw, 320px" />
        {!customizable && onQuickAdd && (
          <div className="absolute bottom-2 right-2 z-[2]">
            <QuickAddControl name={displayName} quantity={quantity} onAdd={onQuickAdd} onDecrement={onDecrement} />
          </div>
        )}
        {showFavorite && (
          <button
            type="button"
            onClick={onToggleFavorite}
            className="absolute right-0 top-0 z-[2] flex h-11 w-11 items-center justify-center touch-manipulation"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated shadow-card">
              <Icon name="heart" className={['h-3.5 w-3.5', isFavorite ? 'fill-danger text-danger' : 'text-muted-foreground'].join(' ')} />
            </span>
          </button>
        )}
      </div>
      <button type="button" onClick={onClick} tabIndex={-1} aria-hidden="true" className="mt-3 text-left touch-manipulation">
        <h3 className="line-clamp-2 break-words text-product text-foreground">{displayName}</h3>
        <p className="mt-0.5 shrink-0 whitespace-nowrap text-price tabular-nums text-muted-foreground">
          {formatPrice(item.price_cents)}
        </p>
      </button>
    </article>
  )
}

/**
 * Elevated "+" disc (36px, 44px tap area, card shadow) that grows into a
 * 108px "− n +" counter in 200ms once the item is in the bag.
 */
function QuickAddControl({
  name,
  quantity,
  onAdd,
  onDecrement,
}: {
  name: string
  quantity: number
  onAdd: () => void
  onDecrement?: () => void
}) {
  const expanded = quantity > 0 && Boolean(onDecrement)
  return (
    <div
      role={expanded ? 'group' : undefined}
      aria-label={expanded ? `Quantity of ${name}` : undefined}
      className={[
        'flex h-9 items-center justify-end rounded-full bg-surface-elevated text-foreground shadow-card transition-[width] duration-200 ease-out-soft',
        expanded ? 'w-[108px]' : 'w-9',
      ].join(' ')}
    >
      {expanded && (
        <>
          <button
            type="button"
            onClick={onDecrement}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full touch-manipulation after:absolute after:-inset-1 active:scale-90"
            aria-label={`Remove ${name}`}
          >
            <Icon name="minus" className="h-4 w-4" />
          </button>
          <span className="min-w-6 flex-1 text-center text-base font-semibold tabular-nums" aria-live="polite" data-testid="quick-add-quantity">
            {quantity}
          </span>
        </>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full touch-manipulation after:absolute after:-inset-1 active:scale-90"
        aria-label={`Add ${name}`}
      >
        <span
          className={[
            'flex h-9 w-9 items-center justify-center rounded-full',
            expanded ? 'bg-foreground text-background' : 'bg-surface-elevated text-foreground',
          ].join(' ')}
        >
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </button>
    </div>
  )
}
