import type { MenuItem, ModifierOption, Order } from '@/types'

/**
 * The part of a past order that can go back in the bag today: the same shop, items
 * still on the menu and not sold out, and modifier options that still exist.
 * Anything else is left out instead of failing the whole "Repetir".
 */
export function reorderableOrder(
  order: Order | null,
  shopId: string,
  menu: { items: MenuItem[]; modifierOptions: ModifierOption[] },
): Order | null {
  if (!order || order.shop_id !== shopId) return null
  const items = new Map(menu.items.map((item) => [item.id, item]))
  const options = new Map(menu.modifierOptions.map((option) => [option.id, option]))
  const kept = (order.items ?? []).filter((line) => {
    const item = items.get(line.item_id)
    if (!item || !item.is_active || item.is_86ed) return false
    return (line.modifiers ?? []).every((modifier) => options.get(modifier.option_id)?.is_active === true)
  })
  if (kept.length === 0) return null
  return { ...order, items: kept }
}
