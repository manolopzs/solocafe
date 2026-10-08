'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createItem, updateItem, deleteItem, toggleItem86 } from '@/server/actions/menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import type { MenuItem, MenuCategory } from '@/types'

export function ItemList({
  shopId,
  items,
  categories,
  currency,
}: {
  shopId: string
  items: MenuItem[]
  categories: MenuCategory[]
  currency: string
}) {
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <form
        action={async (formData: FormData) => {
          await createItem(shopId, {
            name: formData.get('name') as string,
            description: (formData.get('description') as string) || undefined,
            price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
            category_id: (formData.get('category_id') as string) || undefined,
            image_url: (formData.get('image_url') as string) || undefined,
          })
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input name="name" type="text" required placeholder="Nombre del producto" />
          <Input name="price" type="number" step="0.01" required placeholder={`Precio (${currency})`} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            name="category_id"
            className="rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Sin categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Input name="image_url" type="url" placeholder="URL de la imagen (opcional)" />
        </div>
        <textarea
          name="description"
          placeholder="Descripcion corta"
          rows={2}
          className="block w-full resize-none rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
        <Button type="submit" className="w-full sm:w-auto">
          Agregar producto
        </Button>
      </form>

      {items.length > 0 && (
        <ul className="divide-y divide-warm-100 rounded-2xl border border-warm-200 bg-paper">
          {items.map((item) => (
            <li key={item.id} className="p-4">
              {editing === item.id ? (
                <form
                  action={async (formData: FormData) => {
                    await updateItem(shopId, item.id, {
                      name: formData.get('name') as string,
                      description: (formData.get('description') as string) || undefined,
                      price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
                      category_id: (formData.get('category_id') as string) || undefined,
                      image_url: (formData.get('image_url') as string) || undefined,
                    })
                    setEditing(null)
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input name="name" defaultValue={item.name} required />
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={(item.price_cents / 100).toFixed(2)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <select
                      name="category_id"
                      defaultValue={item.category_id ?? ''}
                      className="rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="">Sin categoria</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Input name="image_url" type="url" defaultValue={item.image_url ?? ''} placeholder="URL de la imagen" />
                  </div>
                  <textarea
                    name="description"
                    defaultValue={item.description ?? ''}
                    placeholder="Descripcion corta"
                    rows={2}
                    className="block w-full resize-none rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
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
                <div className="flex items-start gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-warm-100">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-warm-400">{item.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-foreground">{item.name}</span>
                        <span className="ml-2 font-medium text-muted-foreground">
                          {currency} {(item.price_cents / 100).toFixed(2)}
                        </span>
                        {item.is_86ed && (
                          <Badge variant="danger" className="ml-2">
                            Agotado
                          </Badge>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItem86(shopId, item.id, !item.is_86ed)}
                        >
                          {item.is_86ed ? 'Reponer' : 'Agotar'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(item.id)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-red-50 hover:text-red-700"
                          onClick={async () => {
                            if (confirm('Eliminar producto?')) await deleteItem(shopId, item.id)
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
