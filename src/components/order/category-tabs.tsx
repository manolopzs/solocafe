'use client'

import type { MenuCategory } from '@/types'

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: {
  categories: MenuCategory[]
  activeId: string
  onSelect: (id: string) => void
}) {
  if (categories.length === 0) return null

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-3xl">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-4 py-3 no-scrollbar touch-pan-y sm:px-5">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={[
                'snap-start shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 touch-manipulation',
                activeId === category.id
                  ? 'bg-foreground text-primary-foreground shadow-sm'
                  : 'bg-surface text-foreground hover:bg-secondary',
              ].join(' ')}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
