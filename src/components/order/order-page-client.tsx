'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import { createOrder } from '@/server/actions/orders'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Sheet } from '@/components/ui/sheet'
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
}: {
  shop: Shop
  categories: MenuCategory[]
  items: MenuItem[]
  modifierGroups: ModifierGroup[]
  modifierOptions: ModifierOption[]
  itemModifierLinks: ItemModifierLink[]
}) {
  const [cart, setCart] = useState<CartLine[]>([])
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null)
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({})
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
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

  const addToCart = (item: MenuItem) => {
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
        return prev.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...prev, { item, quantity: 1, modifiers: chosen }]
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
    setLoading(true)
    setError(null)

    try {
      await createOrder({
        shop_id: shop.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        pickup_type: 'asap',
        special_instructions: specialInstructions,
        items: cart.map((line) => ({
          menu_item_id: line.item.id,
          quantity: line.quantity,
          modifier_option_ids: line.modifiers.map((m) => m.id),
        })),
      })
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="relative overflow-hidden bg-paper px-5 pt-8 pb-6 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-terracotta-100/50 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <div className="flex items-start gap-4">
            {shop.logo_url ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-sm">
                <Image src={shop.logo_url} alt={shop.name} fill className="object-cover" />
              </div>
            ) : (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{ backgroundColor: shop.brand_color || '#c45d3a' }}
              >
                <Icon name="coffee" className="h-8 w-8" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Buen dia, bienvenido a</p>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">{shop.name}</h1>
              {shop.address && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon name="map-pin" className="h-3.5 w-3.5" />
                  {shop.address}
                </p>
              )}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sage-100 px-3 py-1 text-sm font-medium text-sage-800">
                <span className="inline-flex h-2 w-2 rounded-full bg-sage-500" />
                Abierto · Para recoger
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 border-b border-warm-200 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-2 overflow-x-auto px-5 py-3 no-scrollbar">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={[
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  activeCategory === category.id
                    ? 'bg-terracotta-500 text-white shadow-sm'
                    : 'bg-paper text-warm-700 shadow-xs hover:bg-warm-100',
                ].join(' ')}
              >
                {category.name}
              </button>
            ))}
            {uncategorizedItems.length > 0 && (
              <button
                onClick={() => scrollToCategory('uncategorized')}
                className={[
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  activeCategory === 'uncategorized'
                    ? 'bg-terracotta-500 text-white shadow-sm'
                    : 'bg-paper text-warm-700 shadow-xs hover:bg-warm-100',
                ].join(' ')}
              >
                Otros
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-5 py-6">
        {visibleCategories.map((category) => {
          const categoryItems = itemsByCategory.get(category.id) ?? []
          if (categoryItems.length === 0) return null
          return (
            <section
              key={category.id}
              ref={(el: HTMLDivElement | null) => { categoryRefs.current[category.id] = el }}
              className="mb-10"
            >
              <h2 className="font-serif text-xl font-semibold text-foreground">{category.name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
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
            <h2 className="font-serif text-xl font-semibold text-foreground">Otros</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
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
          onAdd={() => addToCart(activeItem)}
          formatPrice={formatPrice}
        />
      )}

      <Sheet open={cartOpen} onClose={() => setCartOpen(false)} title="Tu pedido">
        <div className="space-y-5">
          {cart.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Icon name="cart" className="mx-auto mb-3 h-10 w-10 text-warm-300" />
              <p>Tu carrito esta vacio</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-100 text-sm font-semibold text-warm-800">
                      {line.quantity}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{line.item.name}</p>
                      {line.modifiers.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {line.modifiers.map((m) => m.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatPrice((line.item.price_cents + line.modifiers.reduce((s, m) => s + m.price_cents, 0)) * line.quantity)}
                      </p>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-warm-100 text-warm-700 hover:bg-warm-200"
                        >
                          <Icon name="minus" className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-warm-100 text-warm-700 hover:bg-warm-200"
                        >
                          <Icon name="plus" className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-warm-200 pt-4">
                <div className="flex items-center justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(totalCents)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-foreground">
                    Nombre
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Como te llaman?"
                    className="mt-1.5 block w-full rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
                  />
                </div>
                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-foreground">
                    Telefono
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Para avisarte cuando este listo"
                    className="mt-1.5 block w-full rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
                  />
                </div>
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-foreground">
                    Instrucciones especiales
                  </label>
                  <textarea
                    id="instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Ej: menos hielo, sin azucar"
                    rows={2}
                    className="mt-1.5 block w-full resize-none rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground placeholder:text-warm-400 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button onClick={handleSubmit} disabled={cart.length === 0 || loading} size="lg" className="w-full">
                {loading ? 'Procesando...' : `Pagar ${formatPrice(totalCents)}`}
              </Button>
            </>
          )}
        </div>
      </Sheet>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-warm-200 bg-paper/95 p-4 shadow-lg backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
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
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm">{totalItems}</span>
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
      className="group flex flex-col overflow-hidden rounded-2xl bg-paper text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-warm-100">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-warm-100 to-warm-200">
            <Icon name="coffee" className="h-10 w-10 text-warm-400" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-base font-semibold leading-tight text-foreground">{item.name}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        )}
        <p className="mt-auto pt-2 text-sm font-semibold text-terracotta-600">{formatPrice(item.price_cents)}</p>
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
  onAdd: () => void
  formatPrice: (cents: number) => string
}) {
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
      <div className="space-y-5">
        <div className="relative flex flex-col items-center">
          <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-3xl bg-warm-100 shadow-sm">
            {item.image_url ? (
              <Image src={item.image_url} alt={item.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-warm-100 to-warm-200">
                <Icon name="coffee" className="h-16 w-16 text-warm-400" />
              </div>
            )}
          </div>
          <h2 className="mt-5 text-center font-serif text-2xl font-semibold text-foreground">{item.name}</h2>
          {item.description && <p className="mt-1 text-center text-sm text-muted-foreground">{item.description}</p>}
        </div>

        {groups.map((group) => (
          <div key={group.id}>
            <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
            <div className="mt-2 grid gap-2">
              {optionsForGroup(group.id).map((option) => {
                const isSelected = (selected[group.id] ?? []).includes(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(group.id, option.id, group.max_select)}
                    className={[
                      'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all',
                      isSelected
                        ? 'border-terracotta-500 bg-terracotta-50 text-foreground'
                        : 'border-warm-200 bg-paper text-foreground hover:bg-warm-50',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={[
                          'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                          isSelected ? 'border-terracotta-500 bg-terracotta-500 text-white' : 'border-warm-300',
                        ].join(' ')}
                      >
                        {isSelected && <Icon name="check" className="h-3.5 w-3.5" />}
                      </span>
                      <span className="font-medium">{option.name}</span>
                    </span>
                    {option.price_cents > 0 && (
                      <span className="text-sm text-muted-foreground">+{formatPrice(option.price_cents)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <Button onClick={onAdd} size="lg" className="w-full">
          Agregar a tu pedido · {formatPrice(itemTotal)}
        </Button>
      </div>
    </Sheet>
  )
}
