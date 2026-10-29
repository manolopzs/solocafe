import { ALLERGEN_CODES, ALLERGEN_LABELS, allergenLabel } from './allergens'

describe('allergenLabel', () => {
  it('returns the Spanish label for every EU allergen code', () => {
    for (const code of ALLERGEN_CODES) {
      expect(allergenLabel(code)).toBe(ALLERGEN_LABELS[code])
      expect(allergenLabel(code)).not.toBe(code)
    }
  })

  it('falls back to the code when unknown', () => {
    expect(allergenLabel('unknown')).toBe('unknown')
  })
})
