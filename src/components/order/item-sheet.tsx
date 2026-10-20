'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { QuantityStepper } from '@/components/order/quantity-stepper'
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
        <div className="relative -mx-6 -mt-2 h-52 overflow-hidden bg-surface sm:h-64">
          {item.image_url ? (
            <Image src={item.image_url} alt="" fill sizes="100vw" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface text-muted-foreground">
              <Icon name="coffee" className="h-14 w-14 opacity-30" />
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm"
            aria-label="Cerrar"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-medium tracking-tight text-foreground">{item.name}</h2>
            <p className="shrink-0 pt-1 text-base font-medium tabular-nums text-foreground">{formatPrice(item.price_cents)}</p>
          </div>
          {item.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>}
        </div>

        {groups.map((group) => (
          <fieldset key={group.id} className="mt-7">
            <legend className="flex w-full items-baseline justify-between gap-3">
              <span className="text-base font-medium text-foreground">{group.name}</span>
              <span className="text-xs text-muted-foreground">
                {group.min_select > 0 ? `Elige ${group.min_select}` : group.max_select > 1 ? `Hasta ${group.max_select}` : 'Opcional'}
              </span>
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {optionsForGroup(group.id).map((option) => {
                const isSelected = (selected[group.id] ?? []).includes(option.id)
                const multiple = group.max_select > 1
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(group.id, option.id, group.max_select)}
                    aria-pressed={isSelected}
                    className={[
                      'flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-3.5 text-left text-sm transition-colors touch-manipulation',
                      isSelected
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={[
                          'flex h-5 w-5 items-center justify-center border-2',
                          multiple ? 'rounded-md' : 'rounded-full',
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background',
                        ].join(' ')}
                        aria-hidden
                      >
                        {isSelected && <Icon name="check" className="h-3 w-3" />}
                      </span>
                      <span className="font-medium">{option.name}</span>
                    </span>
                    {option.price_cents > 0 && (
                      <span className="tabular-nums text-muted-foreground">+{formatPrice(option.price_cents)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        <div className="sticky bottom-0 -mx-6 mt-6 border-t border-border bg-surface-elevated/95 px-4 py-4 backdrop-blur-md">
          {missingRequired && (
            <p className="mb-3 text-center text-sm text-muted-foreground">Elige las opciones obligatorias para continuar.</p>
          )}
          <div className="flex items-center gap-3">
            <QuantityStepper
              value={quantity}
              onDecrease={() => setQuantity((value) => Math.max(1, value - 1))}
              onIncrease={() => setQuantity((value) => value + 1)}
            />
            <Button
              onClick={() => onAdd(quantity, modifierIds)}
              disabled={missingRequired}
              size="lg"
              className="min-w-0 flex-1 px-4"
            >
              Agregar · {formatPrice(itemTotal * quantity)}
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
