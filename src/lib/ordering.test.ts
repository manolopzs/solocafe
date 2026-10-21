import { formatMoney } from './ordering'

describe('formatMoney', () => {
  it('formats euros for Spain', () => {
    expect(formatMoney(200, 'EUR')).toBe('2,00 €')
    expect(formatMoney(280, 'EUR')).toBe('2,80 €')
  })
})