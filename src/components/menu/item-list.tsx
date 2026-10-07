'use client'

import { useState } from 'react'
import { createItem, updateItem, deleteItem, toggleItem86 } from '@/server/actions/menu'
import type { MenuItem, MenuCategory } from '@/types'

export function ItemList({ shopId, items, categories }: { shopId: string; items: MenuItem[]; categories: MenuCategory[] }) {
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <form
        action={async (formData: FormData) => {
          await createItem(shopId, {
            name: formData.get('name') as string,
            price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
            category_id: (formData.get('category_id') as string) || undefined,
          })
        }}
        className="grid grid-cols-1 gap-2 sm:grid-cols-4"
      >
        <input
          name="name"
          type="text"
          required
          placeholder="Nombre del producto"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          required
          placeholder="Precio"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <select name="category_id" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <option value="">Sin categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white sm:col-span-4">
          Agregar producto
        </button>
      </form>

      <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
        {items.map((item) => (
          <li key={item.id} className="p-3">
            {editing === item.id ? (
              <form
                action={async (formData: FormData) => {
                  await updateItem(shopId, item.id, {
                    name: formData.get('name') as string,
                    price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
                    category_id: (formData.get('category_id') as string) || undefined,
                  })
                  setEditing(null)
                }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-4"
              >
                <input
                  name="name"
                  defaultValue={item.name}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm sm:col-span-2"
                />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={(item.price_cents / 100).toFixed(2)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
                />
                <select name="category_id" defaultValue={item.category_id ?? ''} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm">
                  <option value="">Sin categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-2 sm:col-span-4">
                  <button type="submit" className="text-sm font-medium text-zinc-900">Guardar</button>
                  <button type="button" onClick={() => setEditing(null)} className="text-sm text-zinc-600">Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-zinc-900">{item.name}</span>
                  <span className="ml-2 text-sm text-zinc-500">
                    ${(item.price_cents / 100).toFixed(2)}
                  </span>
                  {item.is_86ed && (
                    <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">Agotado</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleItem86(shopId, item.id, !item.is_86ed)}
                    className="text-sm text-zinc-600 hover:text-zinc-900"
                  >
                    {item.is_86ed ? 'Reponer' : 'Agotar'}
                  </button>
                  <button
                    onClick={() => setEditing(item.id)}
                    className="text-sm text-zinc-600 hover:text-zinc-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async () => { if (confirm('Eliminar producto?')) await deleteItem(shopId, item.id) }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
