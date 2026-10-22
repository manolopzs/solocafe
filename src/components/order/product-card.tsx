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
        'group relative rounded-2xl bg-surface-elevated p-3 shadow-xs transition-all duration-200',
        'hover:shadow-sm active:scale-[0.99]',
        highlight ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : '',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 text-left touch-manipulation"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-secondary text-muted-foreground">
              <Icon name="coffee" className="h-7 w-7 opacity-40" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-medium leading-snug text-foreground">{item.name}</h3>
            <p className="shrink-0 pt-0.5 text-sm font-medium tabular-nums text-foreground">
              {formatPrice(item.price_cents)}
            </p>
          </div>
          {item.description && (
            <p className="mt-1 line-clamp-1 text-sm leading-5 text-muted-foreground">{item.description}</p>
          )}
        </div>
      </button>
      {showFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-transform active:scale-95"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Icon
            name="heart"
            className={['h-4 w-4', isFavorite ? 'fill-danger text-danger' : 'text-muted-foreground'].join(' ')}
          />
        </button>
      )}
    </article>
  )
}
