'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/server/actions/menu'
import type { MenuCategory } from '@/types'

export function CategoryList({ shopId, categories }: { shopId: string; categories: MenuCategory[] }) {
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <form
        action={async (formData: FormData) => {
          await createCategory(shopId, { name: formData.get('name') as string })
        }}
        className="flex gap-2"
      >
        <input
          name="name"
          type="text"
          required
          placeholder="Nueva categoria"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Agregar
        </button>
      </form>

      <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between p-3">
            {editing === category.id ? (
              <form
                action={async (formData: FormData) => {
                  await updateCategory(shopId, category.id, { name: formData.get('name') as string })
                  setEditing(null)
                }}
                className="flex flex-1 gap-2"
              >
                <input
                  name="name"
                  defaultValue={category.name}
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                />
                <button type="submit" className="text-sm font-medium text-zinc-900">Guardar</button>
              </form>
            ) : (
              <>
                <span className="text-sm font-medium text-zinc-900">{category.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(category.id)}
                    className="text-sm text-zinc-600 hover:text-zinc-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Eliminar categoria?')) await deleteCategory(shopId, category.id)
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
