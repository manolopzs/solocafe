'use client'

import { useState } from 'react'
import {
  createModifierGroup,
  createModifierOption,
  deleteModifierGroup,
  deleteModifierOption,
} from '@/server/actions/menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import type { ModifierGroup, ModifierOption } from '@/types'

export function ModifierList({
  shopId,
  groups,
  options,
}: {
  shopId: string
  groups: ModifierGroup[]
  options: ModifierOption[]
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <form
        action={async (formData: FormData) => {
          await createModifierGroup(shopId, {
            name: formData.get('name') as string,
            min_select: 0,
            max_select: 1,
          })
        }}
        className="flex flex-col gap-3 rounded-2xl border border-dashed border-warm-300 bg-cream p-4 sm:flex-row"
      >
        <Input
          name="name"
          type="text"
          required
          placeholder="Nuevo grupo, ej. Tipo de leche"
          className="flex-1 border-warm-200 bg-paper"
        />
        <Button type="submit" className="w-full sm:w-auto">
          <Icon name="plus" className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </form>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-paper py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 text-warm-500">
            <Icon name="sliders-horizontal" className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Sin modificadores aun</p>
          <p className="text-xs text-muted-foreground">Agrega opciones como tamano, leche o extras.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {groups.map((group) => {
            const groupOptions = options.filter((o) => o.group_id === group.id)
            const isExpanded = expanded === group.id
            return (
              <li
                key={group.id}
                className="rounded-2xl border border-warm-200 bg-paper p-4 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : group.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-50 text-terracotta-600">
                      <Icon name="sliders-horizontal" className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-semibold text-foreground">{group.name}</span>
                      <span className="text-xs text-muted-foreground">{groupOptions.length} opciones</span>
                    </div>
                    <Icon
                      name="chevron-down"
                      className={`h-4 w-4 text-warm-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-red-50 hover:text-red-700"
                    onClick={async () => {
                      if (confirm('Eliminar grupo?')) await deleteModifierGroup(shopId, group.id)
                    }}
                  >
                    Eliminar
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-warm-100 pt-4 pl-12">
                    <form
                      action={async (formData: FormData) => {
                        await createModifierOption(shopId, group.id, {
                          name: formData.get('name') as string,
                          price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
                        })
                      }}
                      className="flex flex-col gap-2 sm:flex-row"
                    >
                      <Input name="name" type="text" required placeholder="Opcion" className="flex-1 border-warm-200 bg-cream" />
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue="0"
                        placeholder="Precio"
                        className="sm:w-32 border-warm-200 bg-cream"
                      />
                      <Button type="submit" className="w-full sm:w-auto">
                        Agregar
                      </Button>
                    </form>

                    {groupOptions.length > 0 && (
                      <ul className="space-y-2">
                        {groupOptions.map((option) => (
                          <li
                            key={option.id}
                            className="flex items-center justify-between rounded-xl border border-warm-200 bg-cream px-4 py-2.5 text-sm"
                          >
                            <span className="font-medium text-foreground">{option.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-terracotta-600 font-medium">
                                +{(option.price_cents / 100).toFixed(2)}
                              </span>
                              <button
                                onClick={async () => {
                                  if (confirm('Eliminar opcion?'))
                                    await deleteModifierOption(shopId, group.id, option.id)
                                }}
                                className="text-sm text-danger hover:text-red-700"
                              >
                                Eliminar
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
