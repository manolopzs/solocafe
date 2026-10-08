'use client'

import { useState } from 'react'
import {
  createModifierGroup,
  createModifierOption,
  updateModifierGroup,
  deleteModifierGroup,
  deleteModifierOption,
} from '@/server/actions/menu'
import type { ModifierGroup, ModifierOption } from '@/types'

export function ModifierList({ shopId, groups, options }: { shopId: string; groups: ModifierGroup[]; options: ModifierOption[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <form
        action={async (formData: FormData) => {
          await createModifierGroup(shopId, {
            name: formData.get('name') as string,
            min_select: 0,
            max_select: 1,
          })
        }}
        className="flex gap-2"
      >
        <input
          name="name"
          type="text"
          required
          placeholder="Nuevo grupo de modificadores (ej. Leche)"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Agregar
        </button>
      </form>

      <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
        {groups.map((group) => {
          const groupOptions = options.filter((o) => o.group_id === group.id)
          return (
            <li key={group.id} className="p-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpanded(expanded === group.id ? null : group.id)}
                  className="text-left text-sm font-medium text-zinc-900"
                >
                  {group.name}
                  <span className="ml-2 text-xs text-zinc-500">({groupOptions.length} opciones)</span>
                </button>
                <button
                  onClick={async () => { if (confirm('Eliminar grupo?')) await deleteModifierGroup(shopId, group.id) }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>

              {expanded === group.id && (
                <div className="mt-3 space-y-2 pl-4">
                  <form
                    action={async (formData: FormData) => {
                      await createModifierOption(shopId, group.id, {
                        name: formData.get('name') as string,
                        price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
                      })
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Opcion"
                      className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                    />
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                      className="w-24 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                    />
                    <button type="submit" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white">
                      Agregar
                    </button>
                  </form>

                  <ul className="space-y-1">
                    {groupOptions.map((option) => (
                      <li key={option.id} className="flex items-center justify-between text-sm">
                        <span>{option.name} (+${(option.price_cents / 100).toFixed(2)})</span>
                        <button
                          onClick={async () => { if (confirm('Eliminar opcion?')) await deleteModifierOption(shopId, group.id, option.id) }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
