'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { QuantityStepper } from '@/components/order/quantity-stepper'
import { Sheet } from '@/components/ui/sheet'
import { ALLERGEN_LABELS } from '@/lib/allergens'
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
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const defaults: Record<string, string[]> = {}
    for (const group of groups) {
      if (group.min_select > 0 && group.max_select === 1) {
        const first = optionsForGroup(group.id)[0]
        if (first) defaults[group.id] = [first.id]
      }
    }
    return defaults
  })

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
        <div className="relative -mx-6 -mt-2 h-64 overflow-hidden bg-surface sm:h-80">
          {item.image_url ? (
            <Image src={item.image_url} alt="" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
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

          {((item.allergens ?? []).length > 0 || item.may_contain_traces) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(item.allergens ?? []).map((code) => (
                <Badge key={code} variant="secondary" className="text-xs">
                  {ALLERGEN_LABELS[code] ?? code}
                </Badge>
              ))}
              {item.may_contain_traces && (
                <Badge variant="warning" className="text-xs">
                  Puede contener trazas
                </Badge>
              )}
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Si tienes alguna alergia o intolerancia, consulta al personal antes de pedir.
          </p>
        </div>

        {groups.map((group) => {
          const groupOptions = optionsForGroup(group.id)
          const useSegmented = group.max_select === 1 && groupOptions.length <= 4
          const multiple = group.max_select > 1
          return (
            <fieldset key={group.id} className="mt-7">
              <legend className="flex w-full items-baseline justify-between gap-3">
                <span className="text-base font-medium text-foreground">{group.name}</span>
                <span className="text-xs text-muted-foreground">
                  {group.min_select > 0 ? `Elige ${group.min_select}` : group.max_select > 1 ? `Hasta ${group.max_select}` : 'Opcional'}
                </span>
              </legend>
              {useSegmented ? (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {groupOptions.map((option) => {
                    const isSelected = (selected[group.id] ?? []).includes(option.id)
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleOption(group.id, option.id, group.max_select)}
                        aria-pressed={isSelected}
                        className={[
                          'rounded-2xl border px-3 py-3 text-sm font-medium transition-colors touch-manipulation',
                          isSelected
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
                        ].join(' ')}
                      >
                        <span className="block truncate">{option.name}</span>
                        {option.price_cents > 0 && (
                          <span className="block text-xs tabular-nums text-muted-foreground">+{formatPrice(option.price_cents)}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {groupOptions.map((option) => {
                    const isSelected = (selected[group.id] ?? []).includes(option.id)
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
              )}
            </fieldset>
          )
        })}

        <div className="sticky bottom-0 -mx-6 mt-6 border-t border-border bg-background/95 px-4 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md">
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
              className="min-w-0 flex-1 px-4 text-base shadow-sm"
            >
              Añadir · {formatPrice(itemTotal * quantity)}
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  )
}
