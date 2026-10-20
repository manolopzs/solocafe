'use client'

import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import type { MenuItem } from '@/types'

export function ProductCard({
  item,
  customizable,
  isFavorite,
  showFavorite,
  onClick,
  onToggleFavorite,
  formatPrice,
  highlight,
}: {
  item: MenuItem
  customizable: boolean
  isFavorite: boolean
  showFavorite: boolean
  onClick: () => void
  onToggleFavorite: () => void
  formatPrice: (cents: number) => string
  highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated text-left transition-all duration-200 touch-manipulation',
        'hover:shadow-lg hover:border-border/80 active:scale-[0.98]',
        highlight ? 'ring-2 ring-accent ring-offset-2' : '',
      ].join(' ')}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface to-surface-elevated text-muted-foreground">
            <Icon name="coffee" className="h-8 w-8 opacity-30" />
          </div>
        )}
        {customizable && (
          <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[0.6rem] font-bold text-foreground shadow-sm backdrop-blur-sm">
            Personalizable
          </span>
        )}
        {showFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background active:scale-90 touch-manipulation"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Icon
              name="heart"
              className={['h-4 w-4 transition-colors', isFavorite ? 'fill-danger text-danger' : 'text-muted-foreground'].join(' ')}
            />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="text-sm font-bold leading-tight text-foreground sm:text-base">{item.name}</h3>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-[0.65rem] text-muted-foreground sm:mt-1 sm:text-xs">{item.description}</p>
        )}
        <p className="mt-auto pt-2 text-sm font-bold text-foreground">{formatPrice(item.price_cents)}</p>
      </div>
    </button>
  )
}
