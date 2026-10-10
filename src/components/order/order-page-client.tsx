'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createOrder } from '@/server/actions/orders'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { Shop, MenuCategory, MenuItem, ModifierGroup, ModifierOption, ItemModifierLink } from '@/types'

interface CartLine {
  item: MenuItem
  quantity: number
  modifiers: ModifierOption[]
}

export function OrderPageClient({
  shop,
  categories,
  items,
  modifierGroups,
  modifierOptions,
  itemModifierLinks,
  onCreateOrder,
}: {
  shop: Shop
  categories: MenuCategory[]
  items: MenuItem[]
  modifierGroups: ModifierGroup[]
  modifierOptions: ModifierOption[]
  itemModifierLinks: ItemModifierLink[]
  onCreateOrder?: (input: {
    shop_id: string
    customer_name: string
    customer_phone: string
    pickup_type: 'asap' | 'scheduled'
    special_instructions: string
    items: { menu_item_id: string; quantity: number; modifier_option_ids: string[] }[]
  }) => Promise<void> | void
}) {
  const [cart, setCart] = useState<CartLine[]>([])
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null)
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({})
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [pickupType, setPickupType] = useState<'asap' | 'scheduled'>('asap')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? '')

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const groupsForItem = (itemId: string) => {
    const linkIds = itemModifierLinks.filter((l) => l.item_id === itemId).map((l) => l.group_id)
    return modifierGroups.filter((g) => linkIds.includes(g.id))
  }

  const optionsForGroup = (groupId: string) => {
    return modifierOptions.filter((o) => o.group_id === groupId)
  }

  const addToCart = (item: MenuItem, quantity: number) => {
    const groupIds = groupsForItem(item.id).map((g) => g.id)
    const chosen: ModifierOption[] = []
    for (const gid of groupIds) {
      const selected = selectedModifiers[gid] ?? []
      for (const optId of selected) {
        const option = modifierOptions.find((o) => o.id === optId)
        if (option) chosen.push(option)
      }
    }

    setCart((prev) => {
      const existing = prev.find(
        (l) =>
          l.item.id === item.id &&
          JSON.stringify(l.modifiers.map((m) => m.id).sort()) ===
            JSON.stringify(chosen.map((m) => m.id).sort())
      )
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, quantity: l.quantity + quantity } : l))
      }
      return [...prev, { item, quantity, modifiers: chosen }]
    })
    setActiveItem(null)
    setSelectedModifiers({})
  }

  const removeLine = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((line, i) => (i === index ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line))
        .filter((line) => line.quantity > 0)
    )
  }

  const totalCents = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const modifierTotal = line.modifiers.reduce((m, mod) => m + mod.price_cents, 0)
        return sum + (line.item.price_cents + modifierTotal) * line.quantity
      }, 0),
    [cart]
  )

  const totalItems = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart])

  const handleSubmit = async () => {
    if (!customerName) {
      setError('Ingresa tu nombre')
      return
    }
    if (pickupType === 'scheduled') {
      setError('Los horarios programados no estan disponibles todavia')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const input = {
        shop_id: shop.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        pickup_type: pickupType,
        special_instructions: specialInstructions,
        items: cart.map((line) => ({
          menu_item_id: line.item.id,
          quantity: line.quantity,
          modifier_option_ids: line.modifiers.map((m) => m.id),
        })),
      }
      if (onCreateOrder) {
        await onCreateOrder(input)
      } else {
        await createOrder(input)
      }
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Error al crear el pedido')
    }
  }

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const category of categories) {
      map.set(category.id, items.filter((i) => i.category_id === category.id && i.is_active && !i.is_86ed))
    }
    map.set(
      'uncategorized',
      items.filter((i) => !i.category_id && i.is_active && !i.is_86ed)
    )
    return map
  }, [categories, items])

  const visibleCategories = useMemo(() => {
    return categories.filter((c) => (itemsByCategory.get(c.id) ?? []).length > 0)
  }, [categories, itemsByCategory])

  const uncategorizedItems = itemsByCategory.get('uncategorized') ?? []

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
    const el = categoryRefs.current[categoryId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    if (!activeCategory && visibleCategories.length > 0) {
      setActiveCategory(visibleCategories[0].id)
    }
  }, [visibleCategories, activeCategory])

  const formatPrice = (cents: number) => {
    return `${shop.currency} ${(cents / 100).toFixed(2)}`
  }

  const navItems = useMemo(
    () => [
      ...visibleCategories,
      ...(uncategorizedItems.length > 0 ? [{ id: 'uncategorized', name: 'Otros' } as MenuCategory] : []),
    ],
    [visibleCategories, uncategorizedItems.length]
  )

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-6">
          <div className="flex items-start gap-4">
            {shop.logo_url ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                <Image src={shop.logo_url} alt={shop.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
                <Icon name="store" className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bienvenido a</p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{shop.name}</h1>
              {shop.address && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon name="map-pin" className="h-3.5 w-3.5" />
                  {shop.address}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="success">
                  <span className="mr-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                  Abierto
                </Badge>
                <Badge variant="secondary">Para recoger</Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2 overflow-x-auto px-5 py-3 no-scrollbar">
            {navItems.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={[
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  activeCategory === category.id
                    ? 'bg-foreground text-primary-foreground shadow-sm'
                    : 'bg-surface text-foreground hover:bg-secondary',
                ].join(' ')}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-5 py-6">
        {visibleCategories.map((category) => {
          const categoryItems = itemsByCategory.get(category.id) ?? []
          if (categoryItems.length === 0) return null
          return (
            <section
              key={category.id}
              ref={(el: HTMLDivElement | null) => { categoryRefs.current[category.id] = el }}
              className="mb-10"
            >
              <h2 className="text-lg font-semibold text-foreground">{category.name}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {categoryItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onClick={() => setActiveItem(item)}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </section>
          )
        })}

        {uncategorizedItems.length > 0 && (
          <section
            ref={(el: HTMLDivElement | null) => { categoryRefs.current['uncategorized'] = el }}
            className="mb-10"
          >
            <h2 className="text-lg font-semibold text-foreground">Otros</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {uncategorizedItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onClick={() => setActiveItem(item)}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {activeItem && (
        <ProductSheet
          item={activeItem}
          groups={groupsForItem(activeItem.id)}
          optionsForGroup={optionsForGroup}
          selected={selectedModifiers}
          onChange={setSelectedModifiers}
          onClose={() => {
            setActiveItem(null)
            setSelectedModifiers({})
          }}
          onAdd={(quantity) => addToCart(activeItem, quantity)}
          formatPrice={formatPrice}
        />
      )}

      <Sheet open={cartOpen} onClose={() => setCartOpen(false)} title="Tu pedido" position="right" className="flex flex-col">
        <div className="flex h-full flex-col">
          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
                <Icon name="cart" className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium text-foreground">Tu carrito esta vacio</p>
              <p className="mt-1 text-sm">Agrega productos para comenzar tu pedido.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-5 overflow-y-auto">
                <div className="space-y-4">
                  {cart.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-sm font-semibold text-foreground">
                        {line.quantity}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{line.item.name}</p>
                        {line.modifiers.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {line.modifiers.map((m) => m.name).join(', ')}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {formatPrice((line.item.price_cents + line.modifiers.reduce((s, m) => s + m.price_cents, 0)) * line.quantity)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeLine(idx)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-danger"
                          aria-label="Eliminar"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(idx, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface"
                            aria-label="Disminuir"
                          >
                            <Icon name="minus" className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                          <button
                            onClick={() => updateQuantity(idx, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface"
                            aria-label="Aumentar"
                          >
                            <Icon name="plus" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(totalCents)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-foreground">
                      Nombre
                    </label>
                    <Input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Como te llaman?"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-foreground">
                      Telefono
                    </label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Para avisarte cuando este listo"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-foreground">
                      Instrucciones especiales
                    </label>
                    <Textarea
                      id="instructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Ej: menos hielo, sin azucar"
                      rows={2}
                      className="mt-1.5 resize-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="block text-sm font-medium text-foreground">Tipo de recogida</p>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPickupType('asap')}
                      className={[
                        'rounded-lg border px-4 py-3 text-left text-sm transition-all',
                        pickupType === 'asap'
                          ? 'border-foreground bg-foreground text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:bg-surface',
                      ].join(' ')}
                    >
                      <span className="block font-medium">Lo antes posible</span>
                      <span className="block text-xs opacity-80">Preparamos tu pedido ya</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      className="relative rounded-lg border border-border bg-surface px-4 py-3 text-left text-sm text-muted-foreground"
                    >
                      <span className="block font-medium">Programado</span>
                      <span className="block text-xs">Proximamente</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
                    <Icon name="x" className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 -mx-6 -mb-6 mt-5 border-t border-border bg-surface-elevated p-6">
                <Button onClick={handleSubmit} disabled={cart.length === 0 || loading} size="lg" className="w-full">
                  {loading ? 'Procesando...' : `Pagar ${formatPrice(totalCents)}`}
                </Button>
              </div>
            </>
          )}
        </div>
      </Sheet>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background p-4 shadow-lg safe-bottom">
        <div className="mx-auto max-w-3xl">
          <Button
            onClick={() => setCartOpen(true)}
            disabled={cart.length === 0}
            size="lg"
            className="w-full"
          >
            <span className="flex items-center gap-2">
              <Icon name="cart" className="h-5 w-5" />
              Ver pedido
              {totalItems > 0 && (
                <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-sm">{totalItems}</span>
              )}
            </span>
            <span className="ml-auto">{formatPrice(totalCents)}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  item,
  onClick,
  formatPrice,
}: {
  item: MenuItem
  onClick: () => void
  formatPrice: (cents: number) => string
}) {
  return (
    <button
      onClick={onClick}
      className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-surface-elevated p-3 text-left transition-all hover:shadow-md"
    >
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-lg bg-surface">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface">
            <Icon name="utensils" className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h3 className="font-medium text-foreground">{item.name}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        )}
        <p className="mt-auto pt-2 text-sm font-semibold text-foreground">{formatPrice(item.price_cents)}</p>
      </div>
    </button>
  )
}

function ProductSheet({
  item,
  groups,
  optionsForGroup,
  selected,
  onChange,
  onClose,
  onAdd,
  formatPrice,
}: {
  item: MenuItem
  groups: ModifierGroup[]
  optionsForGroup: (groupId: string) => ModifierOption[]
  selected: Record<string, string[]>
  onChange: (s: Record<string, string[]>) => void
  onClose: () => void
  onAdd: (quantity: number) => void
  formatPrice: (cents: number) => string
}) {
  const [quantity, setQuantity] = useState(1)

  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    const current = selected[groupId] ?? []
    if (current.includes(optionId)) {
      onChange({ ...selected, [groupId]: current.filter((id) => id !== optionId) })
    } else {
      const next = maxSelect === 1 ? [optionId] : [...current, optionId]
      onChange({ ...selected, [groupId]: next.slice(0, maxSelect) })
    }
  }

  const itemTotal =
    item.price_cents +
    groups.reduce((sum, group) => {
      const groupOptions = optionsForGroup(group.id)
      const selectedIds = selected[group.id] ?? []
      return (
        sum +
        selectedIds.reduce((s, id) => {
          const opt = groupOptions.find((o) => o.id === id)
          return s + (opt?.price_cents ?? 0)
        }, 0)
      )
    }, 0)

  return (
    <Sheet open onClose={onClose} position="bottom">
      <div className="flex flex-col">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface">
              <Icon name="utensils" className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-semibold text-foreground">{item.name}</h2>
          <p className="text-lg font-semibold text-foreground">{formatPrice(item.price_cents)}</p>
          {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
        </div>

        {groups.map((group) => (
          <div key={group.id} className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
              {group.max_select > 1 && (
                <span className="text-xs text-muted-foreground">Selecciona hasta {group.max_select}</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {optionsForGroup(group.id).map((option) => {
                const isSelected = (selected[group.id] ?? []).includes(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(group.id, option.id, group.max_select)}
                    className={[
                      'rounded-full px-4 py-2 text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-foreground text-primary-foreground'
                        : 'bg-surface text-foreground hover:bg-secondary border border-border',
                    ].join(' ')}
                  >
                    {option.name}
                    {option.price_cents > 0 && (
                      <span className="ml-1.5 opacity-80">+{formatPrice(option.price_cents)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-surface p-2">
          <span className="pl-3 text-sm font-medium text-foreground">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface"
              aria-label="Disminuir"
            >
              <Icon name="minus" className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface"
              aria-label="Aumentar"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 border-t border-border bg-surface-elevated p-6">
          <Button onClick={() => onAdd(quantity)} size="lg" className="w-full">
            Agregar · {formatPrice(itemTotal * quantity)}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
