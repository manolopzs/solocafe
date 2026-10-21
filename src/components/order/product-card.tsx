'use client'

import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import type { MenuItem } from '@/types'

export function ProductCard({
  item,
  isFavorite,
  showFavorite,
  onClick,
  onToggleFavorite,
  formatPrice,
  highlight,
}: {
  item: MenuItem
  customizable?: boolean
  isFavorite: boolean
  showFavorite: boolean
  onClick: () => void
  onToggleFavorite: () => void
  formatPrice: (cents: number) => string
  highlight?: boolean
}) {
  return (
    <article
      className={[
        'relative border-b border-border py-4 transition-colors sm:rounded-3xl sm:border sm:bg-surface-elevated sm:p-3 sm:shadow-xs',
        highlight ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : '',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-4 rounded-2xl text-left transition-transform active:scale-[0.99] touch-manipulation"
      >
        <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-2xl bg-surface">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="104px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-secondary text-muted-foreground">
              <Icon name="coffee" className="h-7 w-7 opacity-40" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <h3 className="text-[15px] font-medium leading-snug text-foreground">{item.name}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{item.description}</p>
          )}
          <p className="mt-2 text-sm font-medium tabular-nums text-foreground">{formatPrice(item.price_cents)}</p>
        </div>
      </button>
      {showFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute left-1 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-transform active:scale-95 sm:left-4 sm:top-4"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Icon
            name="heart"
            className={['h-5 w-5', isFavorite ? 'fill-danger text-danger' : 'text-muted-foreground'].join(' ')}
          />
        </button>
      )}
    </article>
  )
}
