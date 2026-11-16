import manifest from '@/app/manifest'
import { SITE_NAME, storefrontTitle } from './site'

describe('app identity', () => {
  it('titles storefronts with the shop name, not the owner pitch', () => {
    expect(storefrontTitle('Solo cafe')).toBe(`Solo cafe · ${SITE_NAME}`)
    expect(storefrontTitle('  ')).toBe(SITE_NAME)
    expect(storefrontTitle(null)).toBe(SITE_NAME)
  })

  it('ships a Spanish web manifest that opens the customer app with real icons', () => {
    const m = manifest()
    expect(m.name).toBe('Solo Café')
    expect(m.lang).toBe('es-ES')
    expect(m.start_url).toBe('/inicio')
    expect(m.display).toBe('standalone')
    expect(m.theme_color).toMatch(/^#[0-9a-f]{6}$/i)
    expect(m.icons?.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']))
  })
})
