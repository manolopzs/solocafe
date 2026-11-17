import { brandIdentityColor, contrastRatio, readableOn, shopThemeVars } from './shop-theme'

describe('shop theme', () => {
  it('never maps a shop brand colour onto buttons or the CTA', () => {
    const vars = shopThemeVars('fraunces') as Record<string, string>

    expect(Object.keys(vars)).toEqual(['--font-display'])
  })

  it('computes WCAG contrast ratios', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1)
    expect(contrastRatio('#fdf7f2', '#3d6a87')).toBeCloseTo(5.47, 1)
    expect(contrastRatio('nope', '#000000')).toBeNull()
  })

  it('picks the more readable label for a brand colour', () => {
    expect(readableOn('#1f4d3a')).toBe('#ffffff')
    expect(readableOn('#f2c94c')).toBe('#241d1a')
  })

  it('uses a brand colour for identity only when it passes contrast', () => {
    expect(brandIdentityColor('#1f4d3a')).toEqual({ background: '#1f4d3a', foreground: '#ffffff' })
    expect(brandIdentityColor('#8c3d25')).toEqual({ background: '#8c3d25', foreground: '#ffffff' })
  })

  it('falls back to neutral when the brand colour is unset, invalid or too light', () => {
    expect(brandIdentityColor(null)).toBeNull()
    expect(brandIdentityColor(undefined)).toBeNull()
    expect(brandIdentityColor('')).toBeNull()
    expect(brandIdentityColor('#zzzzzz')).toBeNull()
    expect(brandIdentityColor('#f0e6dc')).toBeNull()
  })
})
