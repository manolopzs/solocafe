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
    <div className="space-y-4">
      <form
        action={async (formData: FormData) => {
          await createCategory(shopId, { name: formData.get('name') as string })
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          name="name"
          type="text"
          required
          placeholder="Nueva categoria"
          className="flex-1"
        />
        <Button type="submit" className="w-full sm:w-auto">
          Agregar
        </Button>
      </form>

      {categories.length > 0 && (
        <ul className="divide-y divide-warm-100 rounded-2xl border border-warm-200 bg-paper">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between p-4">
              {editing === category.id ? (
                <form
                  action={async (formData: FormData) => {
                    await updateCategory(shopId, category.id, { name: formData.get('name') as string })
                    setEditing(null)
                  }}
                  className="flex flex-1 flex-col gap-3 sm:flex-row"
                >
                  <Input name="name" defaultValue={category.name} className="flex-1" />
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
                  <span className="font-medium text-foreground">{category.name}</span>
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
