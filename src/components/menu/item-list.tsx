'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createItem, updateItem, deleteItem, toggleItem86 } from '@/server/actions/menu'
import { uploadImageToCloudinary } from '@/lib/cloudinary'
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
    <div className="space-y-6">
      <ItemForm shopId={shopId} categories={categories} currency={currency} onSaved={() => {}} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-paper py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 text-warm-500">
            <Icon name="coffee" className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Sin productos aun</p>
          <p className="text-xs text-muted-foreground">Agrega tu primer producto arriba.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-warm-200 bg-paper p-4 shadow-xs transition-shadow hover:shadow-sm"
            >
              {editing === item.id ? (
                <ItemForm
                  shopId={shopId}
                  item={item}
                  categories={categories}
                  currency={currency}
                  onSaved={() => setEditing(null)}
                />
              ) : (
                <ItemRow
                  item={item}
                  currency={currency}
                  onEdit={() => setEditing(item.id)}
                  onToggle86={() => toggleItem86(shopId, item.id, !item.is_86ed)}
                  onDelete={() => {
                    if (confirm('Eliminar producto?')) deleteItem(shopId, item.id)
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ItemForm({
  shopId,
  item,
  categories,
  currency,
  onSaved,
}: {
  shopId: string
  item?: MenuItem
  categories: MenuCategory[]
  currency: string
  onSaved: () => void
}) {
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const result = await uploadImageToCloudinary(file)
      setImageUrl(result.secure_url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  )

  return (
    <form
      action={async (formData: FormData) => {
        const payload = {
          name: formData.get('name') as string,
          description: (formData.get('description') as string) || undefined,
          price_cents: Math.round(parseFloat(formData.get('price') as string) * 100),
          category_id: (formData.get('category_id') as string) || undefined,
          image_url: imageUrl || undefined,
        }
        if (item) {
          await updateItem(shopId, item.id, payload)
        } else {
          await createItem(shopId, payload)
        }
        setImageUrl('')
        onSaved()
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={item ? `name-${item.id}` : 'new-item-name'} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Nombre
          </Label>
          <Input
            id={item ? `name-${item.id}` : 'new-item-name'}
            name="name"
            type="text"
            required
            placeholder="Nombre del producto"
            defaultValue={item?.name}
            className="mt-1.5 border-warm-200 bg-cream"
          />
        </div>
        <div>
          <Label htmlFor={item ? `price-${item.id}` : 'new-item-price'} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Precio ({currency})
          </Label>
          <Input
            id={item ? `price-${item.id}` : 'new-item-price'}
            name="price"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            defaultValue={item ? (item.price_cents / 100).toFixed(2) : ''}
            className="mt-1.5 border-warm-200 bg-cream"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={item ? `category-${item.id}` : 'new-item-category'} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Categoria
          </Label>
          <select
            id={item ? `category-${item.id}` : 'new-item-category'}
            name="category_id"
            defaultValue={item?.category_id ?? ''}
            className="mt-1.5 block w-full rounded-xl border border-warm-200 bg-cream px-4 py-2.5 text-sm text-foreground focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
          >
            <option value="">Sin categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={item ? `image-${item.id}` : 'new-item-image'} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Imagen
          </Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Input
              id={item ? `image-${item.id}` : 'new-item-image'}
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 border-warm-200 bg-cream"
            />
            {isConfigured && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Button type="button" variant="outline" size="md" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? '...' : 'Subir'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {imageUrl && (
        <div className="relative inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-warm-200 bg-warm-100">
          <Image src={imageUrl} alt="Vista previa" fill className="object-cover" />
          <button
            type="button"
            onClick={() => setImageUrl('')}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-espresso-900/70 text-white transition-colors hover:bg-espresso-900"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
      {!isConfigured && (
        <p className="text-xs text-muted-foreground">
          Configura Cloudinary en las variables de entorno para habilitar la subida de archivos. Mientras tanto, pega una URL de imagen.
        </p>
      )}

      <div>
        <Label htmlFor={item ? `desc-${item.id}` : 'new-item-desc'} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Descripcion
        </Label>
        <textarea
          id={item ? `desc-${item.id}` : 'new-item-desc'}
          name="description"
          placeholder="Descripcion corta del producto"
          rows={2}
          defaultValue={item?.description ?? ''}
          className="mt-1.5 block w-full resize-none rounded-xl border border-warm-200 bg-cream px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" className={item ? '' : 'w-full sm:w-auto'}>
          {item ? 'Guardar cambios' : 'Agregar producto'}
        </Button>
        {item && (
          <Button type="button" variant="ghost" onClick={onSaved}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

function ItemRow({
  item,
  currency,
  onEdit,
  onToggle86,
  onDelete,
}: {
  item: MenuItem
  currency: string
  onEdit: () => void
  onToggle86: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-warm-200 bg-warm-100">
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
            <span className="ml-2 font-medium text-terracotta-600">
              {currency} {(item.price_cents / 100).toFixed(2)}
            </span>
            {item.is_86ed && (
              <Badge variant="danger" className="ml-2">
                Agotado
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onToggle86}>
              {item.is_86ed ? 'Reponer' : 'Agotar'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:bg-red-50 hover:text-red-700"
              onClick={onDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
        {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
      </div>
    </div>
  )
}
