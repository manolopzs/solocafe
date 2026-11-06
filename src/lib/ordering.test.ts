import { checkoutBlockedCopy, formatMoney } from './ordering'

describe('formatMoney', () => {
  it('formats euros for Spain', () => {
    expect(formatMoney(200, 'EUR')).toBe('2,00 €')
    expect(formatMoney(280, 'EUR')).toBe('2,80 €')
  })
})

describe('checkoutBlockedCopy', () => {
  it('returns a Spanish message for known reasons', () => {
    expect(checkoutBlockedCopy('empty')).toBe('Tu pedido está vacío.')
    expect(checkoutBlockedCopy('checking')).toBe('Revisando tu pedido.')
    expect(checkoutBlockedCopy('shop_closed')).toContain('cerrada')
    expect(checkoutBlockedCopy('error')).toContain('revisar')
  })

  it('returns null for unknown or empty reasons', () => {
    expect(checkoutBlockedCopy(null)).toBeNull()
    expect(checkoutBlockedCopy(undefined)).toBeNull()
    expect(checkoutBlockedCopy('unknown')).toBeNull()
  })
})
