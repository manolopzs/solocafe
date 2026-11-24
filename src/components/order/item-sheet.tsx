'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PhosphorIcon } from '@/components/icons/phosphor'
import { QuantityStepper } from '@/components/order/quantity-stepper'
import { Sheet } from '@/components/ui/sheet'
import Image from 'next/image'
import { MenuTileImage } from '@/components/order/menu-tile-image'
import { getMenuItemCutout, storefrontItemName } from '@/lib/storefront-menu'
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
  const cutout = getMenuItemCutout(item)
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
    <Sheet
      open
      onClose={onClose}
      position="bottom"
      bare
      className="!max-h-none h-[calc(100dvh-56px)] !bg-background sm:left-1/2 sm:right-auto sm:top-auto sm:w-full sm:max-w-[var(--phone-col)] sm:-translate-x-1/2 sm:rounded-t-[24px]"
    >
      <div className="flex min-h-full flex-col">
        {/* Hero: surface strip with a 48px curve and the cut-out (mock 03) */}
        <div className="relative h-[430px] shrink-0 overflow-hidden bg-surface">
          {cutout ? (
            <Image
              src={cutout}
              alt=""
              width={324}
              height={324}
              priority
              className="absolute left-1/2 top-[40px] h-[324px] w-[324px] -translate-x-1/2"
            />
          ) : (
            <MenuTileImage item={item} sizes="(max-width: 768px) 100vw, 768px" variant="sheet" iconClassName="h-12 w-12" />
          )}
          <svg className="absolute inset-x-0 -bottom-px h-12 w-full" viewBox="0 0 390 48" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 48V26Q195 -22 390 26V48Z" className="fill-background" />
          </svg>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center touch-manipulation"
            aria-label="Close"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-foreground shadow-card">
              <PhosphorIcon name="x" className="h-5 w-5" />
            </span>
          </button>
        </div>

        <div className="relative -mt-5 px-5">
          <div className="rounded-card border border-border bg-surface-elevated px-5 pb-5 pt-6 shadow-card">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[28px] font-semibold leading-[34px] tracking-[-0.02em] text-foreground">{storefrontItemName(item.name)}</h2>
              <p className="shrink-0 text-[17px] font-semibold tabular-nums text-foreground">{formatPrice(item.price_cents)}</p>
            </div>
            {item.description && <p className="mt-2 text-body-sm text-muted-foreground">{item.description}</p>}
            <div className="my-5 h-px bg-border" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-medium text-foreground">Quantity</span>
              <QuantityStepper
                value={quantity}
                onDecrease={() => setQuantity((value) => Math.max(1, value - 1))}
                onIncrease={() => setQuantity((value) => value + 1)}
              />
            </div>
          </div>
        </div>

        <div className="px-5">
        {groups.map((group) => {
          const groupOptions = optionsForGroup(group.id)
          const useSegmented = group.max_select === 1 && groupOptions.length <= 4
          const multiple = group.max_select > 1
          return (
            <fieldset key={group.id} className="mt-6">
              <legend className="flex w-full items-baseline justify-between gap-3">
                <span className="text-base font-medium text-foreground">{group.name}</span>
                <span className="text-xs text-muted-foreground">
                  {group.min_select > 0 ? `Choose ${group.min_select}` : group.max_select > 1 ? `Up to ${group.max_select}` : 'Optional'}
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
                            {isSelected && <PhosphorIcon name="check" className="h-3 w-3" />}
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

        </div>

        <div className="sticky bottom-0 mt-auto bg-gradient-to-t from-background via-background to-background/0 px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-6">
          {missingRequired && (
            <p className="mb-3 text-center text-body-sm text-muted-foreground">Choose the required options to continue.</p>
          )}
          <Button
            variant="espresso"
            size="lg"
            onClick={() => onAdd(quantity, modifierIds)}
            disabled={missingRequired}
            className="w-full"
          >
            Add · {formatPrice(itemTotal * quantity)}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
