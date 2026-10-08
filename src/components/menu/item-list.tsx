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
    <div className="space-y-4">
      <ItemForm
        shopId={shopId}
        categories={categories}
        currency={currency}
        onSaved={() => {}}
      />

      {items.length > 0 && (
        <ul className="divide-y divide-warm-100 rounded-2xl border border-warm-200 bg-paper">
          {items.map((item) => (
            <li key={item.id} className="p-4">
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
      className="space-y-3"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input name="name" type="text" required placeholder="Nombre del producto" defaultValue={item?.name} />
        <Input
          name="price"
          type="number"
          step="0.01"
          required
          placeholder={`Precio (${currency})`}
          defaultValue={item ? (item.price_cents / 100).toFixed(2) : ''}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          name="category_id"
          defaultValue={item?.category_id ?? ''}
          className="rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="">Sin categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Input
            name="image_url"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de la imagen"
            className="flex-1"
          />
          {isConfigured && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? '...' : 'Subir'}
              </Button>
            </>
          )}
        </div>
      </div>

      {imageUrl && (
        <div className="relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-warm-100">
          <Image src={imageUrl} alt="Vista previa" fill className="object-cover" />
          <button
            type="button"
            onClick={() => setImageUrl('')}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-espresso-900/70 text-white"
          >
            <Icon name="x" className="h-3 w-3" />
          </button>
        </div>
      )}

      {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
      {!isConfigured && (
        <p className="text-xs text-muted-foreground">
          Configura Cloudinary en las variables de entorno para habilitar la subida de archivos. Mientras tanto, pega una URL de imagen.
        </p>
      )}

      <textarea
        name="description"
        placeholder="Descripcion corta"
        rows={2}
        defaultValue={item?.description ?? ''}
        className="block w-full resize-none rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
      />
      <div className="flex gap-2">
        <Button type="submit" className={item ? '' : 'w-full sm:w-auto'}>
          {item ? 'Guardar' : 'Agregar producto'}
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
