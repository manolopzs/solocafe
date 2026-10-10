'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/server/actions/menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import { Sheet } from '@/components/ui/sheet'
import type { MenuCategory } from '@/types'

export function CategoryList({ shopId, categories }: { shopId: string; categories: MenuCategory[] }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setSheetOpen(true)
  }

  const handleOpenEdit = (category: MenuCategory) => {
    setEditingCategory(category)
    setSheetOpen(true)
  }

  const handleSaved = () => {
    setSheetOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categorias</p>
        <Button onClick={handleOpenCreate}>
          <Icon name="plus" className="mr-2 h-4 w-4" />
          Agregar categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
            <Icon name="folder-open" className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Sin categorias aun</p>
          <p className="text-sm text-muted-foreground">Crea la primera para organizar tu menu.</p>
          <Button className="mt-4" onClick={handleOpenCreate}>
            <Icon name="plus" className="mr-2 h-4 w-4" />
            Agregar categoria
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
                  <Icon name="tag" className="h-4 w-4" />
                </div>
                <span className="truncate font-medium text-foreground">{category.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(category)} aria-label="Editar">
                  <Icon name="edit" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-danger hover:text-danger"
                  onClick={async () => {
                    if (confirm('Eliminar categoria?')) await deleteCategory(shopId, category.id)
                  }}
                  aria-label="Eliminar"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingCategory ? 'Editar categoria' : 'Nueva categoria'}
        position="bottom"
      >
        <form
          action={async (formData: FormData) => {
            const name = formData.get('name') as string
            if (editingCategory) {
              await updateCategory(shopId, editingCategory.id, { name })
            } else {
              await createCategory(shopId, { name })
            }
            handleSaved()
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-foreground">
              Nombre
            </label>
            <Input
              id="category-name"
              name="name"
              type="text"
              required
              placeholder="Ej. Bebidas calientes"
              defaultValue={editingCategory?.name ?? ''}
              className="mt-1.5"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingCategory ? 'Guardar cambios' : 'Agregar categoria'}</Button>
            <Button type="button" variant="ghost" onClick={() => setSheetOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  )
}
