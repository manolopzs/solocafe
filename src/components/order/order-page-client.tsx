'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createOrder } from '@/server/actions/orders'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { Shop, MenuCategory, MenuItem, ModifierGroup, ModifierOption, ItemModifierLink, Customer, Order } from '@/types'

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
  customer,
  reorderOrder,
  reorderCount,
  onCreateOrder,
}: {
  shop: Shop
  categories: MenuCategory[]
  items: MenuItem[]
  modifierGroups: ModifierGroup[]
  modifierOptions: ModifierOption[]
  itemModifierLinks: ItemModifierLink[]
  customer: Customer | null
  reorderOrder: Order | null
  reorderCount: number
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
  const [customerName, setCustomerName] = useState(customer?.name ?? '')
  const [customerPhone, setCustomerPhone] = useState(customer?.phone ?? '')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [pickupType, setPickupType] = useState<'asap' | 'scheduled'>('asap')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id ?? '')
  const [addedItemId, setAddedItemId] = useState<string | null>(null)

  useEffect(() => {
    if (!reorderOrder?.items || reorderOrder.items.length === 0) return

    const initialLines: CartLine[] = []
    for (const orderItem of reorderOrder.items) {
      const menuItem = items.find((i) => i.id === orderItem.item_id)
      if (!menuItem || menuItem.is_active === false || menuItem.is_86ed) continue

      const selected: Record<string, string[]> = {}
      const chosenModifiers: ModifierOption[] = []
      for (const mod of orderItem.modifiers ?? []) {
        const option = modifierOptions.find((o) => o.id === mod.option_id)
        if (!option) continue
        const group = modifierGroups.find((g) => g.id === option.group_id)
        if (!group) continue
        selected[group.id] = [...(selected[group.id] ?? []), option.id]
        chosenModifiers.push(option)
      }

      initialLines.push({
        item: menuItem,
        quantity: orderItem.quantity,
        modifiers: chosenModifiers,
      })
    }

    if (initialLines.length > 0) {
      setCart(initialLines)
      setCartOpen(true)
    }
  }, [reorderOrder, items, modifierGroups, modifierOptions])

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const navRef = useRef<HTMLDivElement>(null)

  const groupsForItem = (itemId: string) => {
    const linkIds = itemModifierLinks.filter((l) => l.item_id === itemId).map((l) => l.group_id)
    return modifierGroups.filter((g) => linkIds.includes(g.id))
  }

  const optionsForGroup = (groupId: string) => {
    return modifierOptions.filter((o) => o.group_id === groupId)
  }

  const hasModifiers = (itemId: string) => groupsForItem(itemId).length > 0

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
    setAddedItemId(item.id)
    setTimeout(() => setAddedItemId((id) => (id === item.id ? null : id)), 900)
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
    if (!customerName.trim()) {
      setError('Ingresa tu nombre para continuar')
      return
    }
    if (pickupType === 'scheduled') {
      setError('Los horarios programados aún no están disponibles')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const input = {
        shop_id: shop.id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        pickup_type: pickupType,
        special_instructions: specialInstructions.trim(),
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
      const offset = 120
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!activeCategory && visibleCategories.length > 0) {
      setActiveCategory(visibleCategories[0].id)
    }
  }, [visibleCategories, activeCategory])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 150
      let current = visibleCategories[0]?.id ?? ''
      for (const category of visibleCategories) {
        const el = categoryRefs.current[category.id]
        if (el && el.offsetTop <= scrollPos) {
          current = category.id
        }
      }
      if (uncategorizedItems.length > 0) {
        const el = categoryRefs.current['uncategorized']
        if (el && el.offsetTop <= scrollPos) {
          current = 'uncategorized'
        }
      }
      setActiveCategory(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visibleCategories, uncategorizedItems.length])

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

  const brandColor = shop.brand_color || '#c17c5b'

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="relative overflow-hidden bg-surface">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{ background: `linear-gradient(135deg, ${brandColor} 0%, transparent 65%)` }}
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              {shop.logo_url ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md sm:h-20 sm:w-20">
                  <Image src={shop.logo_url} alt={shop.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-white shadow-md sm:h-20 sm:w-20">
                  <Icon name="store" className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
                </div>
              )}
              <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bienvenido a</p>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{shop.name}</h1>
                {shop.address && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                    <Icon name="map-pin" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="truncate">{shop.address}</span>
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                  <Badge variant="success" className="gap-1.5 pl-2 text-xs sm:text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Abierto
                  </Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">Para recoger</Badge>
                </div>
              </div>
            </div>
            <Link
              href={customer ? '/account' : '/account/login'}
              className="flex shrink-0 items-center justify-center rounded-full bg-white p-2.5 text-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 sm:p-3"
              aria-label={customer ? 'Mi cuenta' : 'Iniciar sesión'}
            >
              <Icon name="user" className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {reorderCount > 0 && (
        <div className="mx-auto max-w-3xl px-4 py-2 sm:px-5">
          <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">
            Se agregaron {reorderCount} productos de tu pedido anterior. Revisa tu carrito.
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <div
            ref={navRef}
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-4 py-3 no-scrollbar touch-pan-y sm:px-5"
          >
            {navItems.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={[
                  'snap-start shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 touch-manipulation',
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

      <main className="mx-auto max-w-3xl px-5 py-7">
        {visibleCategories.map((category) => {
          const categoryItems = itemsByCategory.get(category.id) ?? []
          if (categoryItems.length === 0) return null
          return (
            <section
              key={category.id}
              ref={(el: HTMLDivElement | null) => { categoryRefs.current[category.id] = el }}
              className="mb-12"
            >
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{category.name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 sm:grid-cols-3">
                {categoryItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    customizable={hasModifiers(item.id)}
                    onClick={() => setActiveItem(item)}
                    formatPrice={formatPrice}
                    highlight={addedItemId === item.id}
                  />
                ))}
              </div>
            </section>
          )
        })}

        {uncategorizedItems.length > 0 && (
          <section
            ref={(el: HTMLDivElement | null) => { categoryRefs.current['uncategorized'] = el }}
            className="mb-12"
          >
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Otros</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 sm:grid-cols-3">
              {uncategorizedItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  customizable={hasModifiers(item.id)}
                  onClick={() => setActiveItem(item)}
                  formatPrice={formatPrice}
                  highlight={addedItemId === item.id}
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

      <Sheet open={cartOpen} onClose={() => setCartOpen(false)} title="Tu pedido" position="bottom" className="flex flex-col">
        <div className="flex h-full flex-col">
          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
                <Icon name="cart" className="h-8 w-8" />
              </div>
              <p className="mt-4 font-medium text-foreground">Tu carrito está vacío</p>
              <p className="mt-1 text-sm">Agrega productos para comenzar tu pedido.</p>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-6 overflow-y-auto">
                <div className="space-y-3">
                  {cart.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-sm font-bold text-foreground">
                        {line.quantity}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{line.item.name}</p>
                        {line.modifiers.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {line.modifiers.map((m) => m.name).join(', ')}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-bold text-foreground">
                          {formatPrice((line.item.price_cents + line.modifiers.reduce((s, m) => s + m.price_cents, 0)) * line.quantity)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeLine(idx)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-surface hover:text-danger touch-manipulation"
                          aria-label="Eliminar"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(idx, -1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface touch-manipulation"
                            aria-label="Disminuir"
                          >
                            <Icon name="minus" className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold">{line.quantity}</span>
                          <button
                            onClick={() => updateQuantity(idx, 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface touch-manipulation"
                            aria-label="Aumentar"
                          >
                            <Icon name="plus" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(totalCents)}</span>
                  </div>
                </div>

                {!customer && (
                  <div className="rounded-xl border border-border bg-surface p-4 text-sm">
                    <p className="text-foreground">
                      ¿Quieres guardar este pedido y reordenar más rápido?{' '}
                      <Link href="/account/signup" className="font-bold text-accent hover:underline">
                        Crea una cuenta
                      </Link>
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-semibold text-foreground">
                      Nombre
                    </label>
                    <Input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="¿Cómo te llaman?"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-semibold text-foreground">
                      Teléfono
                    </label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Para avisarte cuando esté listo"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="instructions" className="block text-sm font-semibold text-foreground">
                      Instrucciones especiales
                    </label>
                    <Textarea
                      id="instructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Ej: menos hielo, sin azúcar"
                      rows={2}
                      className="mt-1.5 resize-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="block text-sm font-semibold text-foreground">Tipo de recogida</p>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPickupType('asap')}
                      className={[
                        'rounded-xl border px-4 py-3 text-left text-sm transition-all',
                        pickupType === 'asap'
                          ? 'border-foreground bg-foreground text-primary-foreground'
                          : 'border-border bg-surface-elevated text-foreground hover:bg-surface',
                      ].join(' ')}
                    >
                      <span className="block font-bold">Lo antes posible</span>
                      <span className="block text-xs opacity-80">Preparamos tu pedido ya</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      className="relative rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-muted-foreground"
                    >
                      <span className="block font-bold">Programado</span>
                      <span className="block text-xs">Próximamente</span>
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

              <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 border-t border-border bg-surface-elevated p-4 sm:p-6">
                <Button onClick={handleSubmit} disabled={cart.length === 0 || loading} size="lg" className="w-full touch-manipulation">
                  {loading ? 'Procesando...' : `Pagar ${formatPrice(totalCents)}`}
                </Button>
              </div>
            </>
          )}
        </div>
      </Sheet>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-elevated/95 p-4 shadow-lg backdrop-blur-md safe-bottom">
        <div className="mx-auto max-w-3xl">
          <Button
            onClick={() => setCartOpen(true)}
            disabled={cart.length === 0}
            size="lg"
            className="w-full touch-manipulation"
          >
            <span className="flex items-center gap-2">
              <Icon name="cart" className="h-5 w-5" />
              Ver pedido
              {totalItems > 0 && (
                <span className="rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-sm font-bold">{totalItems}</span>
              )}
            </span>
            <span className="ml-auto font-bold">{formatPrice(totalCents)}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  item,
  customizable,
  onClick,
  formatPrice,
  highlight,
}: {
  item: MenuItem
  customizable: boolean
  onClick: () => void
  formatPrice: (cents: number) => string
  highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated text-left transition-all duration-200 touch-manipulation',
        'hover:shadow-lg hover:border-border/80 active:scale-[0.98]',
        highlight ? 'ring-2 ring-accent ring-offset-2' : '',
      ].join(' ')}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface text-muted-foreground">
            <Icon name="utensils" className="h-8 w-8 opacity-40" />
          </div>
        )}
        {customizable && (
          <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[0.6rem] font-bold text-foreground shadow-sm backdrop-blur-sm">
            Personalizable
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="text-sm font-bold leading-tight text-foreground sm:text-base">{item.name}</h3>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-[0.65rem] text-muted-foreground sm:mt-1 sm:text-xs">{item.description}</p>
        )}
        <p className="mt-auto pt-2 text-sm font-bold text-foreground">{formatPrice(item.price_cents)}</p>
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
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface sm:aspect-[16/10]">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface text-muted-foreground">
              <Icon name="utensils" className="h-16 w-16 opacity-30" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background touch-manipulation"
            aria-label="Cerrar"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 sm:mt-5">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{item.name}</h2>
          <p className="text-base font-bold text-foreground sm:text-lg">{formatPrice(item.price_cents)}</p>
          {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
        </div>

        {groups.map((group) => (
          <div key={group.id} className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">{group.name}</h3>
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
                      'rounded-full px-3.5 py-2 text-sm font-semibold transition-all touch-manipulation',
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

        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface p-2">
          <span className="pl-3 text-sm font-bold text-foreground">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-surface"
              aria-label="Disminuir"
            >
              <Icon name="minus" className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-lg font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-surface"
              aria-label="Aumentar"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 border-t border-border bg-surface-elevated p-4 sm:p-6">
          <Button onClick={() => onAdd(quantity)} size="lg" className="w-full touch-manipulation">
            Agregar · {formatPrice(itemTotal * quantity)}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
