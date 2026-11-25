'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createOrder } from '@/server/actions/orders'
import { addFavorite, removeFavorite } from '@/server/queries/favorites'
import { api } from '@/lib/api/client'
import type { FullMenu } from '@/server/queries/menu'
import { formatMoney, orderErrorCopy } from '@/lib/ordering'
import { hasMultipleCategories, storefrontCategoryName } from '@/lib/storefront-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { PhosphorIcon } from '@/components/icons/phosphor'
import { vibrate } from '@/lib/vibrate'
import { Notice } from '@/components/ui/notice'
import { BagBar } from '@/components/order/bag-bar'
import type { CartViewLine } from '@/components/order/cart-sheet'
import { CategoryTabs } from '@/components/order/category-tabs'
import { CheckoutSheet } from '@/components/order/checkout-sheet'
import { ItemSheet } from '@/components/order/item-sheet'
import { ProductCard } from '@/components/order/product-card'
import { ShopStatusBanner } from '@/components/order/shop-status'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'
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
    customer_email?: string
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
  // Scheduling UI is hidden for now; all orders are ASAP.
  const pickupType = 'asap' as const
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(() => (reorderLines?.length ?? 0) > 0)
  const [redeemLoyalty, setRedeemLoyalty] = useState(false)
  const [addedItemId, setAddedItemId] = useState<string | null>(null)
  const [bagPulse, setBagPulse] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const ordering = menuOrdering ?? shop.ordering
  const {
    preview,
    loyalty,
    loading: previewLoading,
    error: previewError,
    refresh: refreshPreview,
  } = useCartPreview(shop.id, cart.lines, pickupType, livePreview, redeemLoyalty)
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

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY
      setScrolled(top > 24)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const groupsForItem = (itemId: string) => {
    const linkIds = itemModifierLinks.filter((link) => link.item_id === itemId).map((link) => link.group_id)
    return modifierGroups.filter((group) => linkIds.includes(group.id))
  }

  const optionsForGroup = (groupId: string) => modifierOptions.filter((option) => option.group_id === groupId)

  const formatPrice = useCallback(
    (cents: number) => formatMoney(cents, shop.currency, shop.locale),
    [shop.currency, shop.locale],
  )

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
        name: item?.name ?? remote?.name ?? 'Item',
        detail: modifiers.map((option) => option.name).join(', '),
        quantity: line.quantity,
        lineTotal: formatPrice(lineCents),
        unavailable: remote ? !remote.available : false,
        thumb: item ? { name: item.name, image_url: item.image_url } : undefined,
      }
    })
  }, [cart.lines, items, modifierOptions, preview, formatPrice])

  const itemCount = cart.lines.reduce((sum, line) => sum + line.quantity, 0)
  const plainQuantities = useMemo(() => {
    const quantities = new Map<string, number>()
    for (const line of cart.lines) {
      if (line.modifierIds.length === 0) quantities.set(line.itemId, (quantities.get(line.itemId) ?? 0) + line.quantity)
    }
    return quantities
  }, [cart.lines])
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
        : previewError
          ? 'error'
          : preview?.checkout_blocked_reason ?? null
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
  const showCategoryHeadings = hasMultipleCategories(navItems.length)
  const { activeId, scrollTo, setRef } = useCategorySpy(categoryIds)

  const favoriteItems = useMemo(
    () => items.filter((item) => favoriteIds.has(item.id) && item.is_active && !item.is_86ed),
    [items, favoriteIds]
  )

  const featuredItems = useMemo(
    () =>
      items
        .filter((item) => item.is_active && !item.is_86ed && item.image_url)
        .sort((a, b) => a.sort_order - b.sort_order)
        .slice(0, 6),
    [items]
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
    vibrate(10)
    cart.add(item.id, quantity, modifierIds)
    setBagPulse((n) => n + 1)
    setActiveItem(null)
    setAddedItemId(item.id)
    setTimeout(() => setAddedItemId((id) => (id === item.id ? null : id)), 900)
  }

  const quickAdd = (item: MenuItem) => {
    vibrate(10)
    cart.add(item.id, 1, [])
    setBagPulse((n) => n + 1)
    setAddedItemId(item.id)
    setTimeout(() => setAddedItemId((id) => (id === item.id ? null : id)), 900)
  }

  const quickRemove = (item: MenuItem) => {
    const index = cart.lines.findIndex((line) => line.itemId === item.id && line.modifierIds.length === 0)
    if (index === -1) return
    cart.setQuantity(index, cart.lines[index].quantity - 1)
  }

  const reorderRecent = (order: Order) => {
    const next = linesFromOrder(order)
    if (next.length === 0) return
    cart.replace(next)
    setSheetOpen(true)
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
    setNotice(available.length < usualOrder.items.length ? 'We removed what is no longer available.' : null)
    setSheetOpen(true)
  }

  const handleSubmit = async (input: {
    customerName: string
    customerPhone: string
    customerEmail: string
    specialInstructions: string
    pickupType: 'asap'
    redeemLoyalty?: boolean
  }) => {
    setLoading(true)
    setError(null)
    const payload = {
      shop_id: shop.id,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      pickup_type: input.pickupType,
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
      cart.clear()
    } catch (err) {
      if (isNextRedirect(err)) {
        cart.clear()
        throw err
      }
      setLoading(false)
      setError(orderErrorCopy(err instanceof Error ? err.message : ''))
    }
  }

  const sheetsOpen = sheetOpen
  const menuIsEmpty = visibleCategories.length === 0 && uncategorizedItems.length === 0

  return (
    <div className="pb-bag min-h-screen bg-background">
      <div ref={headerRef} className="shop-top-bar sticky top-0 z-30" data-scrolled={scrolled}>
        <div className="phone-col flex h-14 items-center justify-between px-5">
          <Link href="/inicio" className="flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label="Back to Home">
            <PhosphorIcon name="arrow-left" className="h-[22px] w-[22px]" />
          </Link>
          <div className="flex min-w-0 flex-col items-center justify-center">
            <SoloCafeWordmark height={20} />
            <span
              className={[
                'max-w-[160px] truncate text-[13px] font-semibold leading-4 text-heading transition-all duration-200 motion-reduce:transition-none',
                scrolled ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
              ].join(' ')}
              aria-hidden={!scrolled}
            >
              {shop.name}
            </span>
          </div>
          <Link
            href={customer ? '/account' : '/account/login'}
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={customer ? 'Account' : 'Log in'}
          >
            <PhosphorIcon name="user" className="h-[22px] w-[22px]" />
          </Link>
        </div>
      </div>
      <header className="phone-col px-5">
        <div
          className={[
            'bg-background pb-1 pt-2 transition-opacity duration-200 motion-reduce:transition-none',
            scrolled ? 'pointer-events-none opacity-0' : 'opacity-100',
          ].join(' ')}
        >
          <div className="flex items-center gap-3">
            {shop.logo_url && (
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface">
                <Image src={shop.logo_url} alt="" fill sizes="44px" className="object-cover" />
              </span>
            )}
            <h1 className="shop-display-font min-w-0 truncate text-h1 text-heading">{shop.name}</h1>
          </div>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-body-sm text-muted-foreground">
            {shop.address && (
              <>
                <PhosphorIcon name="map-pin" className="h-4 w-4 shrink-0" />
                <span className="truncate">{shop.address}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="shrink-0">Pickup</span>
          </p>
        </div>
      </header>

      <div className="mt-3">
        <ShopStatusBanner ordering={liveOrdering} hours={shop.operating_hours} />
      </div>

      {usualOrder && <UsualOrderButton usual={usualOrder} onOrder={orderUsual} />}

      {notice && (
        <div className="phone-col px-5 pt-3">
          <Notice>{notice}</Notice>
        </div>
      )}

      {reorderCount > 0 && (
        <div className="phone-col px-5 pt-3">
          <Notice>We added {reorderCount} items from your previous order. Review your order.</Notice>
        </div>
      )}

      {recentOrders.length > 0 && (
        <section className="phone-col px-5 pt-5">
          <h2 className="text-sm font-medium text-muted-foreground">Recent orders</h2>
          <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 no-scrollbar">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => reorderRecent(order)}
                className="w-52 shrink-0 snap-start rounded-2xl bg-surface p-3 text-left transition-colors hover:bg-secondary"
              >
                <p className="text-xs font-semibold text-muted-foreground">
                  {order.item_count ?? order.items?.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
                <p className="mt-1 line-clamp-1 text-sm font-bold text-foreground">
                  {order.items?.map((item) => item.item_name_snapshot).join(', ')}
                </p>
                <p className="mt-1 text-xs text-accent">
                  {formatPrice(order.total_cents)} · Reorder
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {favoriteItems.length > 0 && (
        <section className="phone-col px-5 pt-5">
          <h2 className="text-sm font-medium text-muted-foreground">Your favorites</h2>
          <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 no-scrollbar">
            {favoriteItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveItem(item)}
                className="w-36 shrink-0 snap-start rounded-2xl bg-surface p-2 text-left transition-transform active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill sizes="144px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <PhosphorIcon name="coffee" className="h-6 w-6 opacity-30" />
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 px-1 text-sm font-medium leading-snug text-foreground">{item.name}</p>
                <p className="px-1 text-sm tabular-nums text-muted-foreground">{formatPrice(item.price_cents)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {featuredItems.length > 0 && (
        <section className="phone-col px-5 pt-5">
          <h2 className="text-sm font-medium text-muted-foreground">Featured</h2>
          <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 no-scrollbar">
            {featuredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveItem(item)}
                className="w-36 shrink-0 snap-start rounded-2xl bg-surface p-2 text-left transition-transform active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface">
                  <Image src={item.image_url!} alt={item.name} fill sizes="144px" className="object-cover" />
                </div>
                <p className="mt-2 line-clamp-2 px-1 text-sm font-medium leading-snug text-foreground">{item.name}</p>
                <p className="px-1 text-sm tabular-nums text-muted-foreground">{formatPrice(item.price_cents)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <CategoryTabs categories={navItems} activeId={activeId} onSelect={scrollTo} />

      <main className="phone-col animate-rise px-5 pt-5">
        {menuIsEmpty && (
          <EmptyState
            icon={<PhosphorIcon name="coffee" className="h-6 w-6" />}
            title="The menu is on its way"
            description="This coffee shop hasn't published pickup items yet."
          />
        )}
        {visibleCategories.map((category) => {
          const categoryItems = itemsByCategory.get(category.id) ?? []
          if (categoryItems.length === 0) return null
          return (
            <section key={category.id} ref={setRef(category.id)} className="scroll-mt-16 pb-8">
              {showCategoryHeadings && (
                <h2 className="shop-display-font text-h2 text-heading">{storefrontCategoryName(category.name)}</h2>
              )}
              <div className={[showCategoryHeadings ? 'mt-3' : '', 'grid grid-cols-2 gap-x-3 gap-y-5'].join(' ')}>
                {categoryItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    customizable={groupsForItem(item.id).length > 0}
                    isFavorite={favoriteIds.has(item.id)}
                    showFavorite={customer !== null}
                    onClick={() => setActiveItem(item)}
                    onQuickAdd={() => quickAdd(item)}
                    quantity={plainQuantities.get(item.id) ?? 0}
                    onDecrement={() => quickRemove(item)}
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
          <section ref={setRef('uncategorized')} className="scroll-mt-16 pb-8">
            {showCategoryHeadings && <h2 className="shop-display-font text-h2 text-heading">Others</h2>}
            <div className={[showCategoryHeadings ? 'mt-3' : '', 'grid grid-cols-2 gap-x-3 gap-y-5'].join(' ')}>
              {uncategorizedItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  customizable={groupsForItem(item.id).length > 0}
                  isFavorite={favoriteIds.has(item.id)}
                  showFavorite={customer !== null}
                  onClick={() => setActiveItem(item)}
                  onQuickAdd={() => quickAdd(item)}
                  quantity={plainQuantities.get(item.id) ?? 0}
                  onDecrement={() => quickRemove(item)}
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

      <CheckoutSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        shop={{ ...shop, ordering: liveOrdering }}
        customer={customer}
        lines={viewLines}
        total={formatPrice(totalCents)}
        etaMinutes={livePreview && pickupType === 'asap' ? preview?.estimated_ready_minutes : undefined}
        blockedReason={blockedReason}
        previewError={previewError}
        onRefreshPreview={refreshPreview}
        loading={loading}
        error={error}
        rewardText={canRedeem ? loyalty?.reward_text : null}
        redeemLoyalty={redeemLoyalty && canRedeem}
        onRedeemLoyalty={setRedeemLoyalty}
        onQuantity={(index, quantity) => cart.setQuantity(index, quantity)}
        onRemove={(index) => cart.remove(index)}
        onSubmit={(input) => void handleSubmit(input)}
      />

      {!sheetsOpen && (
        <BagBar
          count={itemCount}
          total={formatPrice(totalCents)}
          etaMinutes={livePreview && pickupType === 'asap' ? preview?.estimated_ready_minutes : undefined}
          onOpen={() => setSheetOpen(true)}
          pulseKey={bagPulse}
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
