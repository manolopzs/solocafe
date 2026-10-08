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
    <div className="space-y-4">
      <form
        action={async (formData: FormData) => {
          await createModifierGroup(shopId, {
            name: formData.get('name') as string,
            min_select: 0,
            max_select: 1,
          })
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          name="name"
          type="text"
          required
          placeholder="Nuevo grupo (ej. Leche)"
          className="flex-1"
        />
        <Button type="submit" className="w-full sm:w-auto">
          Agregar
        </Button>
      </form>

      {groups.length > 0 && (
        <ul className="divide-y divide-warm-100 rounded-2xl border border-warm-200 bg-paper">
          {groups.map((group) => {
            const groupOptions = options.filter((o) => o.group_id === group.id)
            const isExpanded = expanded === group.id
            return (
              <li key={group.id} className="p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : group.id)}
                    className="flex items-center gap-2 text-left font-semibold text-foreground"
                  >
                    <Icon
                      name="chevron-right"
                      className={`h-4 w-4 text-warm-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                    {group.name}
                    <span className="text-xs font-normal text-muted-foreground">({groupOptions.length} opciones)</span>
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
                  <div className="mt-4 space-y-3 pl-6">
                    <form
                      action={async (formData: FormData) => {
                        await createModifierOption(shopId, group.id, {
                          name: formData.get('name') as string,
                          price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
                        })
                      }}
                      className="flex flex-col gap-2 sm:flex-row"
                    >
                      <Input name="name" type="text" required placeholder="Opcion" className="flex-1" />
                      <Input
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue="0"
                        placeholder="Precio"
                        className="sm:w-32"
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
                            className="flex items-center justify-between rounded-xl bg-warm-50 px-4 py-2.5 text-sm"
                          >
                            <span className="font-medium text-foreground">{option.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">
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
