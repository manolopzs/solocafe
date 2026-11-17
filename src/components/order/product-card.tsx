'use client'

import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { getMenuItemImage, storefrontItemName } from '@/lib/storefront-menu'
import type { MenuItem } from '@/types'

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
  const image = getMenuItemImage(item)
  const displayName = storefrontItemName(item.name)

  return (
    <article
      className={[
        'group relative flex flex-col overflow-hidden rounded-2xl bg-surface-elevated shadow-xs transition-all duration-200',
        'hover:shadow-sm active:scale-[0.99]',
        highlight ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : '',
      ].join(' ')}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        <button
          type="button"
          onClick={onClick}
          className="absolute inset-0 z-[1] touch-manipulation"
          aria-label={displayName}
        />
        {image ? (
          <Image
            src={image.src}
            style={{ objectPosition: image.cardPosition }}
            alt=""
            fill
            className="pointer-events-none object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 320px"
          />
        ) : (
          <div className="pointer-events-none flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-secondary text-muted-foreground">
            <Icon name="coffee" className="h-10 w-10 opacity-30" />
          </div>
        )}
      </div>
      <div className="relative flex flex-1 flex-col p-3">
        <button
          type="button"
          onClick={onClick}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 touch-manipulation"
        />
        <h3 className="pointer-events-none relative text-[15px] font-medium leading-snug text-foreground line-clamp-2 break-words">
          {displayName}
        </h3>
        {item.description && (
          <p className="pointer-events-none relative mt-0.5 line-clamp-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
        )}
        <div className="pointer-events-none relative mt-auto flex min-h-11 items-center justify-between gap-1.5 pt-1">
          <p className="pointer-events-none shrink-0 whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
            {formatPrice(item.price_cents)}
          </p>
          {!customizable && onQuickAdd && (
            <QuickAddControl
              name={displayName}
              quantity={quantity}
              onAdd={onQuickAdd}
              onDecrement={onDecrement}
            />
          )}
        </div>
      </div>
      {showFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-transform active:scale-95"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Icon
            name="heart"
            className={['h-3.5 w-3.5', isFavorite ? 'fill-danger text-danger' : 'text-muted-foreground'].join(' ')}
          />
        </button>
      )}
    </article>
  )
}

/**
 * Sky "+" disc (36px visual, 44px tap area) that turns into a "− 1 +" stepper
 * once the item is in the bag. Removing the last unit brings the disc back.
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
  if (quantity > 0 && onDecrement) {
    return (
      <div
        role="group"
        aria-label={`Cantidad de ${name}`}
        className="pointer-events-auto -mr-0.5 flex h-9 shrink-0 items-center rounded-full bg-sky text-foreground"
      >
        <button
          type="button"
          onClick={onDecrement}
          className="flex h-11 w-8 items-center justify-center rounded-full touch-manipulation active:scale-90"
          aria-label={`Quitar ${name}`}
        >
          <Icon name="minus" className="h-4 w-4" />
        </button>
        <span className="min-w-4 text-center text-sm font-semibold tabular-nums" aria-live="polite" data-testid="quick-add-quantity">
          {quantity}
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="flex h-11 w-8 items-center justify-center rounded-full touch-manipulation active:scale-90"
          aria-label={`Añadir ${name}`}
        >
          <Icon name="plus" className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className="pointer-events-auto -mr-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full touch-manipulation transition-transform active:scale-90"
      aria-label={`Añadir ${name}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky text-foreground">
        <Icon name="plus" className="h-4 w-4" />
      </span>
    </button>
  )
}
