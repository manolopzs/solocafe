import { reorderableOrder } from './reorder'
import type { MenuItem, ModifierOption, Order } from '@/types'

const item = (id: string, extra: Partial<MenuItem> = {}) => ({ id, is_active: true, is_86ed: false, ...extra }) as MenuItem
const option = (id: string, is_active = true) => ({ id, is_active }) as ModifierOption
const line = (item_id: string, optionIds: string[] = []) => ({
  item_id,
  quantity: 1,
  item_name_snapshot: item_id,
  modifiers: optionIds.map((option_id) => ({ option_id })),
})
const order = (items: ReturnType<typeof line>[], shop_id = 'shop-1') => ({ id: 'o1', shop_id, items }) as unknown as Order

const menu = {
  items: [item('latte'), item('cortado'), item('agotado', { is_86ed: true }), item('retirado', { is_active: false })],
  modifierOptions: [option('avena'), option('vieja', false)],
}

describe('reorderableOrder', () => {
  it('keeps every line that can still be ordered', () => {
    const past = order([line('latte', ['avena']), line('cortado')])
    expect(reorderableOrder(past, 'shop-1', menu)?.items).toHaveLength(2)
  })

  it('skips sold-out, removed or unknown items and lines with a retired option', () => {
    const past = order([line('latte'), line('agotado'), line('retirado'), line('borrado'), line('cortado', ['vieja'])])
    expect(reorderableOrder(past, 'shop-1', menu)?.items?.map((l) => l.item_id)).toEqual(['latte'])
  })

  it('returns null when nothing is left, the order is from another shop, or there is no order', () => {
    expect(reorderableOrder(order([line('agotado')]), 'shop-1', menu)).toBeNull()
    expect(reorderableOrder(order([line('latte')], 'shop-2'), 'shop-1', menu)).toBeNull()
    expect(reorderableOrder(null, 'shop-1', menu)).toBeNull()
  })
})
