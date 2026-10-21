'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  saveMenuItem,
  deleteItem,
  toggleItem86,
  linkModifierGroup,
  unlinkModifierGroup,
} from '@/server/actions/menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Sheet } from '@/components/ui/sheet'
import type { MenuItem, MenuCategory, ModifierGroup, ItemModifierLink } from '@/types'

export function ItemList({
  shopId,
  items,
  categories,
  modifierGroups,
  itemModifierLinks,
  currency,
}: {
  shopId: string
  items: MenuItem[]
  categories: MenuCategory[]
  modifierGroups: ModifierGroup[]
  itemModifierLinks: ItemModifierLink[]
  currency: string
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  const handleOpenCreate = () => {
    setEditingItem(null)
    setSheetOpen(true)
  }

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item)
    setSheetOpen(true)
  }

  const handleSaved = () => {
    setSheetOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} productos</p>
        <Button onClick={handleOpenCreate}>
          <Icon name="plus" className="mr-2 h-4 w-4" />
          Agregar producto
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
            <Icon name="package" className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Sin productos aun</p>
          <p className="text-sm text-muted-foreground">Agrega tu primer producto para empezar a vender.</p>
          <Button className="mt-4" onClick={handleOpenCreate}>
            <Icon name="plus" className="mr-2 h-4 w-4" />
            Agregar producto
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <ItemRow
                item={item}
                currency={currency}
                onEdit={() => handleOpenEdit(item)}
                onToggle86={() => toggleItem86(shopId, item.id, !item.is_86ed)}
                onDelete={() => {
                  if (confirm('Eliminar producto?')) deleteItem(shopId, item.id)
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingItem ? 'Editar producto' : 'Nuevo producto'}
        position="bottom"
      >
        <ItemForm
          shopId={shopId}
          item={editingItem ?? undefined}
          categories={categories}
          modifierGroups={modifierGroups}
          itemModifierLinks={itemModifierLinks}
          currency={currency}
          onSaved={handleSaved}
        />
      </Sheet>
    </div>
  )
}

function ItemForm({
  shopId,
  item,
  categories,
  modifierGroups = [],
  itemModifierLinks = [],
  currency,
  onSaved,
}: {
  shopId: string
  item?: MenuItem
  categories: MenuCategory[]
  modifierGroups?: ModifierGroup[]
  itemModifierLinks?: ItemModifierLink[]
  currency: string
  onSaved: () => void
}) {
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '')
  const [removePhoto, setRemovePhoto] = useState(false)

  return (
    <form
      action={async (formData: FormData) => {
        formData.set('image_url', imageUrl)
        formData.set('remove_photo', removePhoto ? '1' : '0')
        await saveMenuItem(shopId, item?.id ?? null, formData)
        setImageUrl('')
        onSaved()
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={item ? `name-${item.id}` : 'new-item-name'}>Nombre</Label>
          <Input
            id={item ? `name-${item.id}` : 'new-item-name'}
            name="name"
            type="text"
            required
            placeholder="Nombre del producto"
            defaultValue={item?.name}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor={item ? `price-${item.id}` : 'new-item-price'}>Precio ({currency})</Label>
          <Input
            id={item ? `price-${item.id}` : 'new-item-price'}
            name="price"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            defaultValue={item ? (item.price_cents / 100).toFixed(2) : ''}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={item ? `category-${item.id}` : 'new-item-category'}>Categoría</Label>
          <Select
            id={item ? `category-${item.id}` : 'new-item-category'}
            name="category_id"
            defaultValue={item?.category_id ?? ''}
            className="mt-1.5"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={item ? `image-${item.id}` : 'new-item-image'}>Imagen</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Input
              id={item ? `image-${item.id}` : 'new-item-image'}
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
          </div>
          <Input
            id={item ? `photo-${item.id}` : 'new-item-photo'}
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2"
            onChange={() => setRemovePhoto(false)}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG o WebP, hasta 5 MB. También puedes pegar una URL.</p>
        </div>
      </div>

      {imageUrl && (
        <div className="relative inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
          <Image src={imageUrl} alt="Vista previa" fill sizes="96px" className="object-cover" />
          <button
            type="button"
            onClick={() => {
              setImageUrl('')
              setRemovePhoto(true)
            }}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div>
        <Label htmlFor={item ? `desc-${item.id}` : 'new-item-desc'}>Descripción</Label>
        <Textarea
          id={item ? `desc-${item.id}` : 'new-item-desc'}
          name="description"
          placeholder="Descripción corta del producto"
          rows={2}
          defaultValue={item?.description ?? ''}
          className="mt-1.5"
        />
      </div>

      {item && modifierGroups.length > 0 && (
        <ModifierLinkSection
          shopId={shopId}
          itemId={item.id}
          modifierGroups={modifierGroups}
          itemModifierLinks={itemModifierLinks}
        />
      )}

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

function ModifierLinkSection({
  shopId,
  itemId,
  modifierGroups,
  itemModifierLinks,
}: {
  shopId: string
  itemId: string
  modifierGroups: ModifierGroup[]
  itemModifierLinks: ItemModifierLink[]
}) {
  const links = itemModifierLinks.filter((l) => l.item_id === itemId)

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Label className="text-sm font-medium">Modificadores disponibles</Label>
      <div className="mt-3 flex flex-wrap gap-2">
        {modifierGroups.map((group) => {
          const link = links.find((l) => l.group_id === group.id)
          const isLinked = Boolean(link)
          return (
            <Button
              key={group.id}
              type="button"
              variant={isLinked ? 'primary' : 'outline'}
              size="sm"
              onClick={async () => {
                if (isLinked && link) {
                  await unlinkModifierGroup(shopId, link.id)
                } else {
                  await linkModifierGroup(shopId, itemId, group.id)
                }
              }}
            >
              {isLinked && <Icon name="check" className="mr-1.5 h-3.5 w-3.5" />}
              {group.name}
            </Button>
          )
        })}
      </div>
      {modifierGroups.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Crea grupos de modificadores primero.</p>}
    </div>
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
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-shadow hover:shadow-sm">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{item.name}</p>
            <p className="text-sm font-medium text-accent">
              {currency} {(item.price_cents / 100).toFixed(2)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant={item.is_86ed ? 'destructive' : 'outline'}
              size="sm"
              onClick={onToggle86}
            >
              {item.is_86ed ? 'Agotado' : 'Activo'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
              <Icon name="edit" className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-danger hover:text-danger" onClick={onDelete} aria-label="Eliminar">
              <Icon name="trash" className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {item.description && <p className="mt-1 truncate text-sm text-muted-foreground">{item.description}</p>}
      </div>
    </div>
  )
}
