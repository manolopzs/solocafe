'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/server/actions/menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import type { MenuCategory } from '@/types'

export function CategoryList({ shopId, categories }: { shopId: string; categories: MenuCategory[] }) {
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <form
        action={async (formData: FormData) => {
          await createCategory(shopId, { name: formData.get('name') as string })
        }}
        className="flex flex-col gap-3 rounded-2xl border border-dashed border-warm-300 bg-cream p-4 sm:flex-row"
      >
        <Input
          name="name"
          type="text"
          required
          placeholder="Nueva categoria, ej. Bebidas calientes"
          className="flex-1 border-warm-200 bg-paper"
        />
        <Button type="submit" className="w-full sm:w-auto">
          <Icon name="plus" className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </form>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-paper py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 text-warm-500">
            <Icon name="folder-open" className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Sin categorias aun</p>
          <p className="text-xs text-muted-foreground">Crea la primera para organizar tu menu.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between rounded-2xl border border-warm-200 bg-paper p-4 shadow-xs transition-shadow hover:shadow-sm"
            >
              {editing === category.id ? (
                <form
                  action={async (formData: FormData) => {
                    await updateCategory(shopId, category.id, { name: formData.get('name') as string })
                    setEditing(null)
                  }}
                  className="flex w-full flex-col gap-3 sm:flex-row"
                >
                  <Input name="name" defaultValue={category.name} className="flex-1 border-warm-200 bg-cream" />
                  <div className="flex gap-2">
                    <Button type="submit" variant="outline" size="sm">
                      Guardar
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-50 text-terracotta-600">
                      <Icon name="tag" className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(category.id)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-red-50 hover:text-red-700"
                      onClick={async () => {
                        if (confirm('Eliminar categoria?')) await deleteCategory(shopId, category.id)
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
