'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Sheet } from '@/components/ui/sheet'
import type { MenuItem, ModifierGroup, ModifierOption } from '@/types'

export function ItemSheet({
  item,
  groups,
  optionsForGroup,
  onClose,
  onAdd,
  formatPrice,
}: {
  item: MenuItem
  groups: ModifierGroup[]
  optionsForGroup: (groupId: string) => ModifierOption[]
  onClose: () => void
  onAdd: (quantity: number, modifierIds: string[]) => void
  formatPrice: (cents: number) => string
}) {
  const [quantity, setQuantity] = useState(1)
  const [selected, setSelected] = useState<Record<string, string[]>>({})

  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    const current = selected[groupId] ?? []
    if (current.includes(optionId)) {
      setSelected({ ...selected, [groupId]: current.filter((id) => id !== optionId) })
      return
    }
    const next = maxSelect === 1 ? [optionId] : [...current, optionId]
    setSelected({ ...selected, [groupId]: next.slice(0, maxSelect) })
  }

  const modifierIds = groups.flatMap((group) => selected[group.id] ?? [])
  const missingRequired = groups.some((group) => (selected[group.id]?.length ?? 0) < group.min_select)
  const extras = modifierIds.reduce((sum, id) => {
    const option = groups.flatMap((group) => optionsForGroup(group.id)).find((candidate) => candidate.id === id)
    return sum + (option?.price_cents ?? 0)
  }, 0)
  const itemTotal = item.price_cents + extras

  return (
    <Sheet open onClose={onClose} position="bottom">
      <div className="flex flex-col">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface sm:aspect-[16/10]">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} fill sizes="100vw" className="object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface text-muted-foreground">
              <Icon name="utensils" className="h-16 w-16 opacity-30" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background touch-manipulation"
            aria-label="Cerrar"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 sm:mt-5">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{item.name}</h2>
          <p className="text-base font-bold text-foreground sm:text-lg">{formatPrice(item.price_cents)}</p>
          {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
        </div>

        {groups.map((group) => (
          <div key={group.id} className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">{group.name}</h3>
              {group.min_select > 0 ? (
                <span className="text-xs text-muted-foreground">Elige {group.min_select}</span>
              ) : group.max_select > 1 ? (
                <span className="text-xs text-muted-foreground">Hasta {group.max_select}</span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {optionsForGroup(group.id).map((option) => {
                const isSelected = (selected[group.id] ?? []).includes(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(group.id, option.id, group.max_select)}
                    className={[
                      'rounded-full px-3.5 py-2 text-sm font-semibold transition-all touch-manipulation',
                      isSelected
                        ? 'bg-foreground text-primary-foreground'
                        : 'border border-border bg-surface text-foreground hover:bg-secondary',
                    ].join(' ')}
                  >
                    {option.name}
                    {option.price_cents > 0 && <span className="ml-1.5 opacity-80">+{formatPrice(option.price_cents)}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface p-2">
          <span className="pl-3 text-sm font-bold text-foreground">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-surface"
              aria-label="Disminuir"
            >
              <Icon name="minus" className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-lg font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((value) => value + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-surface"
              aria-label="Aumentar"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 border-t border-border bg-surface-elevated p-4 sm:p-6">
          <Button
            onClick={() => onAdd(quantity, modifierIds)}
            disabled={missingRequired}
            size="lg"
            className="w-full touch-manipulation"
          >
            Agregar · {formatPrice(itemTotal * quantity)}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
