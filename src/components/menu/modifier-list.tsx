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
import { Sheet } from '@/components/ui/sheet'
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
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{groups.length} grupos</p>
        <Button onClick={() => setSheetOpen(true)}>
          <Icon name="plus" className="mr-2 h-4 w-4" />
          Agregar grupo
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
            <Icon name="sliders-horizontal" className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Sin modificadores aun</p>
          <p className="text-sm text-muted-foreground">Agrega opciones como tamano, leche o extras.</p>
          <Button className="mt-4" onClick={() => setSheetOpen(true)}>
            <Icon name="plus" className="mr-2 h-4 w-4" />
            Agregar grupo
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {groups.map((group) => {
            const groupOptions = options.filter((o) => o.group_id === group.id)
            const isExpanded = expanded === group.id
            return (
              <li key={group.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : group.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
                      <Icon name="sliders-horizontal" className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate font-medium text-foreground">{group.name}</span>
                      <span className="text-xs text-muted-foreground">{groupOptions.length} opciones</span>
                    </div>
                    <Icon
                      name="chevron-down"
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-danger hover:text-danger"
                    onClick={async () => {
                      if (confirm('Eliminar grupo?')) await deleteModifierGroup(shopId, group.id)
                    }}
                    aria-label="Eliminar grupo"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4 pl-12">
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
                            className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                          >
                            <span className="font-medium text-foreground">{option.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-accent">+{(option.price_cents / 100).toFixed(2)}</span>
                              <button
                                onClick={async () => {
                                  if (confirm('Eliminar opcion?'))
                                    await deleteModifierOption(shopId, group.id, option.id)
                                }}
                                className="text-sm text-danger hover:text-danger/80"
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

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Nuevo grupo de modificadores" position="bottom">
        <form
          action={async (formData: FormData) => {
            await createModifierGroup(shopId, {
              name: formData.get('name') as string,
              min_select: 0,
              max_select: 1,
            })
            setSheetOpen(false)
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-foreground">
              Nombre
            </label>
            <Input
              id="group-name"
              name="name"
              type="text"
              required
              placeholder="Ej. Tipo de leche"
              className="mt-1.5"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Agregar grupo</Button>
            <Button type="button" variant="ghost" onClick={() => setSheetOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
