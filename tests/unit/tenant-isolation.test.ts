import { readFileSync } from 'fs'
import { join } from 'path'

const migrationPath = join(__dirname, '../../supabase/migrations/00000000000000_initial_schema.sql')
const migration = readFileSync(migrationPath, 'utf-8')

describe('tenant isolation schema', () => {
  it('enables row level security on all tenant tables', () => {
    const tables = [
      'shops',
      'shop_members',
      'shop_subscriptions',
      'menu_categories',
      'menu_items',
      'modifier_groups',
      'modifier_options',
      'item_modifier_links',
      'pickup_slots',
      'orders',
      'order_items',
      'order_item_modifiers',
      'payments',
      'slot_reservations',
      'events',
    ]
    for (const table of tables) {
      expect(migration).toContain(`alter table ${table} enable row level security`)
    }
  })

  it('restricts orders by shop membership', () => {
    expect(migration).toContain('orders_staff_manage')
    expect(migration).toContain("on orders for all")
    expect(migration).toContain('is_shop_member(shop_id)')
  })

  it('restricts payments by shop membership', () => {
    expect(migration).toContain('payments_staff_manage')
    expect(migration).toContain("on payments for all")
  })

  it('exposes only active shop data publicly', () => {
    expect(migration).toContain('shops_public_read')
    expect(migration).toContain("status = 'active'")
  })
})
