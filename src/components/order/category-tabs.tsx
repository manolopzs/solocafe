'use client'

import { useEffect, useRef } from 'react'
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
  const activeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const node = activeRef.current
    const scroller = node?.parentElement
    if (!node || !scroller) return
    const left = node.offsetLeft - scroller.clientWidth / 2 + node.clientWidth / 2
    scroller.scrollTo({ left, behavior: 'smooth' })
  }, [activeId])

  if (categories.length === 0) return null

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-3xl">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-3 py-2 no-scrollbar touch-pan-y sm:px-4">
          {categories.map((category) => {
            const active = activeId === category.id
            return (
              <button
                key={category.id}
                ref={active ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(category.id)}
                aria-current={active ? 'true' : undefined}
                className={[
                  'snap-start shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all touch-manipulation',
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-foreground',
                ].join(' ')}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
