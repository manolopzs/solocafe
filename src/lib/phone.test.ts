import { dialPrefixForLocale, phonePlaceholder } from './phone'

describe('dialPrefixForLocale', () => {
  it('maps the shop locale to its country prefix', () => {
    expect(dialPrefixForLocale('es-ES')).toBe('+34')
    expect(dialPrefixForLocale('es')).toBe('+34')
    expect(dialPrefixForLocale('en-GB')).toBe('+44')
    expect(dialPrefixForLocale('pt')).toBe('+351')
  })

  it('defaults to +34 when the locale is missing or unknown', () => {
    expect(dialPrefixForLocale()).toBe('+34')
    expect(dialPrefixForLocale('')).toBe('+34')
    expect(dialPrefixForLocale('xx-XX')).toBe('+34')
    expect(dialPrefixForLocale('ja-JP')).toBe('+34')
  })
})

describe('phonePlaceholder', () => {
  it('includes the prefix', () => {
    expect(phonePlaceholder('en-GB')).toBe('So we can tell you when it is ready (+44)')
    expect(phonePlaceholder()).toBe('So we can tell you when it is ready (+34)')
  })
})
