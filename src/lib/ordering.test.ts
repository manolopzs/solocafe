import { checkoutBlockedCopy, formatMoney, shopNumberLocale } from './ordering'

describe('formatMoney', () => {
  it('formats euros for Spain', () => {
    expect(formatMoney(200, 'EUR', 'es-ES')).toBe('2,00 €')
    expect(formatMoney(280, 'EUR', 'es-ES')).toBe('2,80 €')
  })

  it('formats pounds for Great Britain', () => {
    expect(formatMoney(200, 'GBP', 'en-GB')).toBe('£2.00')
  })

  it('resolves a bare language tag to a default region', () => {
    expect(formatMoney(200, 'EUR', 'es')).toBe('2,00 €')
  })

  it('falls back to es-ES/EUR for invalid locale or currency', () => {
    expect(formatMoney(200, '', 'not-a-locale')).toBe('2,00 €')
    expect(formatMoney(200, 'INVALID', 'es-ES')).toBe('2,00 €')
  })
})

describe('shopNumberLocale', () => {
  it('returns full BCP 47 tags when supported', () => {
    expect(shopNumberLocale('es-ES')).toBe('es-ES')
    expect(shopNumberLocale('en-GB')).toBe('en-GB')
  })

  it('maps bare languages to default regions', () => {
    expect(shopNumberLocale('es')).toBe('es-ES')
    expect(shopNumberLocale('en')).toBe('en-GB')
    expect(shopNumberLocale('fr')).toBe('fr-FR')
    expect(shopNumberLocale('de')).toBe('de-DE')
    expect(shopNumberLocale('it')).toBe('it-IT')
    expect(shopNumberLocale('pt')).toBe('pt-PT')
    expect(shopNumberLocale('ca')).toBe('ca-ES')
  })

  it('falls back to es-ES for missing or unsupported tags', () => {
    expect(shopNumberLocale()).toBe('es-ES')
    expect(shopNumberLocale('')).toBe('es-ES')
    expect(shopNumberLocale('xx-XX')).toBe('es-ES')
  })
})

describe('checkoutBlockedCopy', () => {
  it('returns an English message for known reasons', () => {
    expect(checkoutBlockedCopy('empty')).toBe('Your order is empty.')
    expect(checkoutBlockedCopy('checking')).toBe('Checking your order.')
    expect(checkoutBlockedCopy('shop_closed')).toContain('closed')
    expect(checkoutBlockedCopy('error')).toContain("couldn't")
  })

  it('returns null for unknown or empty reasons', () => {
    expect(checkoutBlockedCopy(null)).toBeNull()
    expect(checkoutBlockedCopy(undefined)).toBeNull()
    expect(checkoutBlockedCopy('unknown')).toBeNull()
  })
})
