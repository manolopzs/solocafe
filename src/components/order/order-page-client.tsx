'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createOrder } from '@/server/actions/orders'
import { addFavorite, removeFavorite } from '@/server/queries/favorites'
import { api } from '@/lib/api/client'
import type { FullMenu } from '@/server/queries/menu'
import { checkoutBlockedCopy, formatMoney, orderErrorCopy } from '@/lib/ordering'
import { Icon } from '@/components/ui/icon'
import { BagBar } from '@/components/order/bag-bar'
import { CartSheet, type CartViewLine } from '@/components/order/cart-sheet'
import { CategoryTabs } from '@/components/order/category-tabs'
import { CheckoutSheet } from '@/components/order/checkout-sheet'
import { ItemSheet } from '@/components/order/item-sheet'
import { ProductCard } from '@/components/order/product-card'
import { ShopStatusBadge, ShopStatusBanner } from '@/components/order/shop-status'
import { UsualOrderButton } from '@/components/order/usual-order-button'
import { useCartPreview } from '@/components/order/hooks/use-cart-preview'
import { useCategorySpy } from '@/components/order/hooks/use-category-spy'
import { useShopCart, type StoredCartLine } from '@/components/order/hooks/use-shop-cart'
import type {
  Customer,
  MenuCategory,
  MenuItem,
  ModifierGroup,
  ModifierOption,
  ItemModifierLink,
  Order,
  Shop,
  ShopOrdering,
  UsualOrder,
} from '@/types'

export function OrderPageClient({
  shop,
  categories,
  items: initialItems,
  modifierGroups,
  modifierOptions,
  itemModifierLinks,
  customer,
  reorderOrder,
  reorderCount,
  favoriteIds: initialFavoriteIds,
  recentOrders,
  usualOrder,
  livePreview = true,
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
  favoriteIds: string[]
  recentOrders: Order[]
  usualOrder?: UsualOrder | null
  livePreview?: boolean
  onCreateOrder?: (input: {
    shop_id: string
    customer_name: string
    customer_phone: string
    pickup_type: 'asap' | 'scheduled'
    pickup_slot_date?: string
    pickup_slot_start_time?: string
    special_instructions: string
    redeem_loyalty?: boolean
    items: { menu_item_id: string; quantity: number; modifier_option_ids: string[] }[]
  }) => Promise<void> | void
}) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [menuOrdering, setMenuOrdering] = useState<ShopOrdering | undefined>(undefined)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(initialFavoriteIds))
  const reorderLines = useMemo(() => (reorderOrder ? linesFromOrder(reorderOrder) : null), [reorderOrder])
  const cart = useShopCart(shop.id, reorderLines)
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null)
  const [pickupChoice, setPickupChoice] = useState<'asap' | 'scheduled' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(() => (reorderLines?.length ?? 0) > 0)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [redeemLoyalty, setRedeemLoyalty] = useState(false)
  const [addedItemId, setAddedItemId] = useState<string | null>(null)
  const ordering = menuOrdering ?? shop.ordering
  const pickupType: 'asap' | 'scheduled' =
    ordering && !ordering.asap_available && ordering.accepting_pickup ? 'scheduled' : (pickupChoice ?? 'asap')
  const { preview, loyalty, loading: previewLoading } = useCartPreview(
    shop.id,
    cart.lines,
    pickupType,
    livePreview,
    redeemLoyalty
  )
  const canRedeem = loyalty?.can_redeem === true
  const liveOrdering = preview?.ordering ?? ordering

  useEffect(() => {
    const refreshMenu = async () => {
      try {
        const data = await api.get<FullMenu & { shop?: { ordering?: ShopOrdering } }>(
          `/public/shops/${shop.id}/menu`,
          false
        )
        setItems(data.items)
        if (data.shop?.ordering) setMenuOrdering(data.shop.ordering)
      } catch {
        // The next poll can recover.
      }
    }

    const interval = setInterval(() => void refreshMenu(), 15000)
    return () => clearInterval(interval)
  }, [shop.id])

  const groupsForItem = (itemId: string) => {
    const linkIds = itemModifierLinks.filter((link) => link.item_id === itemId).map((link) => link.group_id)
    return modifierGroups.filter((group) => linkIds.includes(group.id))
  }

  const optionsForGroup = (groupId: string) => modifierOptions.filter((option) => option.group_id === groupId)

  const formatPrice = useCallback((cents: number) => formatMoney(cents, shop.currency), [shop.currency])

  const viewLines: CartViewLine[] = useMemo(() => {
    return cart.lines.map((line, index) => {
      const item = items.find((candidate) => candidate.id === line.itemId)
      const modifiers = line.modifierIds
        .map((id) => modifierOptions.find((option) => option.id === id))
        .filter((option): option is ModifierOption => Boolean(option))
      const remote = preview?.lines[index]
      const catalogUnit = (item?.price_cents ?? 0) + modifiers.reduce((sum, option) => sum + option.price_cents, 0)
      const lineCents = remote?.line_total_cents ?? catalogUnit * line.quantity
      return {
        key: `${line.itemId}:${line.modifierIds.join(',')}:${index}`,
        name: item?.name ?? remote?.name ?? 'Producto',
        detail: modifiers.map((option) => option.name).join(', '),
        quantity: line.quantity,
        lineTotal: formatPrice(lineCents),
        unavailable: remote ? !remote.available : false,
      }
    })
  }, [cart.lines, items, modifierOptions, preview, formatPrice])

  const itemCount = cart.lines.reduce((sum, line) => sum + line.quantity, 0)
  const catalogTotal = cart.lines.reduce((sum, line) => {
    const item = items.find((candidate) => candidate.id === line.itemId)
    const modifiers = line.modifierIds
      .map((id) => modifierOptions.find((option) => option.id === id))
      .filter((option): option is ModifierOption => Boolean(option))
    const unit = (item?.price_cents ?? 0) + modifiers.reduce((total, option) => total + option.price_cents, 0)
    return sum + unit * line.quantity
  }, 0)
  const totalCents = livePreview && preview ? preview.total_cents : catalogTotal
  const blockedReason = !livePreview
    ? null
    : itemCount === 0
      ? 'empty'
      : previewLoading && !preview
        ? 'checking'
        : preview?.checkout_blocked_reason ?? null
  const blockedCopy = itemCount === 0 ? null : checkoutBlockedCopy(blockedReason)

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const category of categories) {
      map.set(category.id, items.filter((item) => item.category_id === category.id && item.is_active && !item.is_86ed))
    }
    map.set(
      'uncategorized',
      items.filter((item) => !item.category_id && item.is_active && !item.is_86ed)
    )
    return map
  }, [categories, items])

  const visibleCategories = useMemo(
    () => categories.filter((category) => (itemsByCategory.get(category.id) ?? []).length > 0),
    [categories, itemsByCategory]
  )
  const uncategorizedItems = itemsByCategory.get('uncategorized') ?? []
  const navItems = useMemo(
    () => [
      ...visibleCategories,
      ...(uncategorizedItems.length > 0 ? [{ id: 'uncategorized', name: 'Otros', shop_id: shop.id, sort_order: 99, is_active: true, created_at: '' } satisfies MenuCategory] : []),
    ],
    [visibleCategories, uncategorizedItems.length, shop.id]
  )
  const categoryIds = useMemo(() => navItems.map((category) => category.id), [navItems])
  const { activeId, scrollTo, setRef } = useCategorySpy(categoryIds)

  const favoriteItems = useMemo(
    () => items.filter((item) => favoriteIds.has(item.id) && item.is_active && !item.is_86ed),
    [items, favoriteIds]
  )

  const toggleFavorite = async (itemId: string) => {
    if (!customer) return
    const isFavorite = favoriteIds.has(itemId)
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isFavorite) next.delete(itemId)
      else next.add(itemId)
      return next
    })
    try {
      if (isFavorite) await removeFavorite(shop.id, itemId)
      else await addFavorite(shop.id, itemId)
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isFavorite) next.add(itemId)
        else next.delete(itemId)
        return next
      })
    }
  }

  const addToCart = (item: MenuItem, quantity: number, modifierIds: string[]) => {
    cart.add(item.id, quantity, modifierIds)
    setActiveItem(null)
    setAddedItemId(item.id)
    setTimeout(() => setAddedItemId((id) => (id === item.id ? null : id)), 900)
  }

  const reorderRecent = (order: Order) => {
    const next = linesFromOrder(order)
    if (next.length === 0) return
    cart.replace(next)
    setCartOpen(true)
  }

  const orderUsual = () => {
    if (!usualOrder?.can_reorder) return
    const available = usualOrder.items.filter((item) => item.available)
    if (available.length === 0) return
    cart.replace(
      available.map((item) => ({
        itemId: item.menu_item_id,
        quantity: item.quantity,
        modifierIds: item.modifier_option_ids,
      }))
    )
    setNotice(available.length < usualOrder.items.length ? 'Quitamos lo que ya no está disponible.' : null)
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  const handleSubmit = async (input: {
    customerName: string
    customerPhone: string
    specialInstructions: string
    pickupType: 'asap' | 'scheduled'
    pickupSlotDate?: string
    pickupSlotStartTime?: string
    redeemLoyalty?: boolean
  }) => {
    setLoading(true)
    setError(null)
    const payload = {
      shop_id: shop.id,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      pickup_type: input.pickupType,
      pickup_slot_date: input.pickupSlotDate,
      pickup_slot_start_time: input.pickupSlotStartTime,
      special_instructions: input.specialInstructions,
      redeem_loyalty: input.redeemLoyalty === true && canRedeem,
      items: cart.lines.map((line) => ({
        menu_item_id: line.itemId,
        quantity: line.quantity,
        modifier_option_ids: line.modifierIds,
      })),
    }
    try {
      if (onCreateOrder) await onCreateOrder(payload)
      else await createOrder(payload)
    } catch (err) {
      if (isNextRedirect(err)) throw err
      setLoading(false)
      setError(orderErrorCopy(err instanceof Error ? err.message : ''))
    }
  }

  const sheetsOpen = cartOpen || checkoutOpen

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="bg-surface">
        <div className="mx-auto max-w-3xl px-4 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              {shop.logo_url ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md sm:h-20 sm:w-20">
                  <Image src={shop.logo_url} alt={shop.name} fill sizes="80px" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-white shadow-md sm:h-20 sm:w-20">
                  <Icon name="store" className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
                </div>
              )}
              <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">Bienvenido a</p>
                <h1 className="shop-display-font text-xl font-bold tracking-tight text-foreground sm:text-2xl">{shop.name}</h1>
                {shop.address && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                    <Icon name="map-pin" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="truncate">{shop.address}</span>
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                  <ShopStatusBadge ordering={liveOrdering} />
                  <span className="text-xs font-medium text-muted-foreground">Para recoger</span>
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

      <ShopStatusBanner ordering={liveOrdering} hours={shop.operating_hours} />

      {usualOrder && <UsualOrderButton usual={usualOrder} onOrder={orderUsual} />}

      {notice && (
        <div className="mx-auto max-w-3xl px-4 pt-3 sm:px-5">
          <p className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">{notice}</p>
        </div>
      )}

      {reorderCount > 0 && (
        <div className="mx-auto max-w-3xl px-4 py-2 sm:px-5">
          <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">
            Agregamos {reorderCount} productos de tu pedido anterior. Revisa tu pedido.
          </div>
        </div>
      )}

      {recentOrders.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pt-4 sm:px-5">
          <h2 className="text-sm font-bold text-foreground">Pedidos recientes</h2>
          <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => reorderRecent(order)}
                className="snap-start shrink-0 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-elevated"
              >
                <p className="text-xs font-semibold text-muted-foreground">
                  {order.item_count ?? order.items?.reduce((sum, item) => sum + item.quantity, 0)} productos
                </p>
                <p className="mt-1 line-clamp-1 text-sm font-bold text-foreground">
                  {order.items?.map((item) => item.item_name_snapshot).join(', ')}
                </p>
                <p className="mt-1 text-xs text-accent">
                  {formatPrice(order.total_cents)} · Reordenar
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {favoriteItems.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pt-4 sm:px-5">
          <h2 className="text-sm font-bold text-foreground">Tus favoritos</h2>
          <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar">
            {favoriteItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="w-32 shrink-0 snap-start rounded-xl border border-border bg-surface p-2 text-left transition-colors hover:bg-surface-elevated"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Icon name="coffee" className="h-6 w-6 opacity-30" />
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-bold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(item.price_cents)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <CategoryTabs categories={navItems} activeId={activeId} onSelect={scrollTo} />

      <main className="mx-auto max-w-3xl px-5 py-7">
        {visibleCategories.map((category) => {
          const categoryItems = itemsByCategory.get(category.id) ?? []
          if (categoryItems.length === 0) return null
          return (
            <section key={category.id} ref={setRef(category.id)} className="mb-12">
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{category.name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">
                {categoryItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    customizable={groupsForItem(item.id).length > 0}
                    isFavorite={favoriteIds.has(item.id)}
                    showFavorite={customer !== null}
                    onClick={() => setActiveItem(item)}
                    onToggleFavorite={() => void toggleFavorite(item.id)}
                    formatPrice={formatPrice}
                    highlight={addedItemId === item.id}
                  />
                ))}
              </div>
            </section>
          )
        })}

        {uncategorizedItems.length > 0 && (
          <section ref={setRef('uncategorized')} className="mb-12">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Otros</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">
              {uncategorizedItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  customizable={groupsForItem(item.id).length > 0}
                  isFavorite={favoriteIds.has(item.id)}
                  showFavorite={customer !== null}
                  onClick={() => setActiveItem(item)}
                  onToggleFavorite={() => void toggleFavorite(item.id)}
                  formatPrice={formatPrice}
                  highlight={addedItemId === item.id}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {activeItem && (
        <ItemSheet
          item={activeItem}
          groups={groupsForItem(activeItem.id)}
          optionsForGroup={optionsForGroup}
          onClose={() => setActiveItem(null)}
          onAdd={(quantity, modifierIds) => addToCart(activeItem, quantity, modifierIds)}
          formatPrice={formatPrice}
        />
      )}

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={viewLines}
        total={formatPrice(totalCents)}
        blockedCopy={blockedCopy}
        onQuantity={(index, quantity) => cart.setQuantity(index, quantity)}
        onRemove={(index) => cart.remove(index)}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        shop={{ ...shop, ordering: liveOrdering }}
        customer={customer}
        total={formatPrice(totalCents)}
        blockedReason={blockedReason}
        pickupType={pickupType}
        onPickupType={setPickupChoice}
        loading={loading}
        error={error}
        rewardText={canRedeem ? loyalty?.reward_text : null}
        redeemLoyalty={redeemLoyalty && canRedeem}
        onRedeemLoyalty={setRedeemLoyalty}
        onSubmit={(input) => void handleSubmit(input)}
      />

      {!sheetsOpen && (
        <BagBar
          count={itemCount}
          total={formatPrice(totalCents)}
          etaMinutes={livePreview && pickupType === 'asap' ? preview?.estimated_ready_minutes : undefined}
          onOpen={() => setCartOpen(true)}
        />
      )}
    </div>
  )
}

function isNextRedirect(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT')
  )
}

function linesFromOrder(order: Order): StoredCartLine[] {
  return (order.items ?? []).map((item) => ({
    itemId: item.item_id,
    quantity: item.quantity,
    modifierIds: (item.modifiers ?? []).map((modifier) => modifier.option_id),
  }))
}
