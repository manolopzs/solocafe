import { demoItems, demoModifierOptions, demoOrders } from './demo-data'

test('demo order lines and totals reconcile to menu and modifier prices', () => {
  for (const order of demoOrders) {
    let subtotal = 0
    for (const line of order.items) {
      const menuItem = demoItems.find((item) => item.id === line.item_id)
      expect(menuItem).toBeDefined()
      const modifierTotal = line.modifiers.reduce((sum, modifier) => {
        const option = demoModifierOptions.find((candidate) => candidate.id === modifier.option_id)
        expect(option).toBeDefined()
        expect(modifier.price_cents).toBe(option?.price_cents)
        return sum + modifier.price_cents
      }, 0)
      expect(line.unit_price_cents).toBe((menuItem?.price_cents ?? 0) + modifierTotal)
      expect(line.subtotal_cents).toBe(line.unit_price_cents * line.quantity)
      subtotal += line.subtotal_cents
    }
    expect(order.subtotal_cents).toBe(subtotal)
    expect(order.total_cents).toBe(subtotal + order.tax_cents + order.tip_cents)
  }
})
