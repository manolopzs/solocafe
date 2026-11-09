import { getMenuItemImage, storefrontItemName, storefrontCategoryName } from './storefront-menu'

describe('customer menu presentation', () => {
  test.each([
    ['Latte', '/menu/latte.jpg', '72% 62%', '78% 55%'],
    [' CORTADO ', '/menu/cortado.jpg', 'center', '50% 40%'],
    ['Cafe con leche', '/menu/cafe-con-leche.jpg', 'center', 'center'],
    ['Café con leche', '/menu/cafe-con-leche.jpg', 'center', 'center'],
  ])('uses a hosted fallback for %s', (name, src, cardPosition, sheetPosition) => {
    expect(getMenuItemImage({ name, image_url: null })).toEqual({ src, cardPosition, sheetPosition })
    expect(getMenuItemImage({ name, image_url: '' })).toEqual({ src, cardPosition, sheetPosition })
  })

  test('keeps an existing product photo and its default positioning', () => {
    const src = 'https://api.example.com/rails/active_storage/photo.jpg'
    expect(getMenuItemImage({ name: 'Latte', image_url: src })).toEqual({ src })
  })

  test('does not invent photos for other drinks', () => {
    expect(getMenuItemImage({ name: 'Mocha', image_url: null })).toBeNull()
  })

  test('only accents the requested item and category display names', () => {
    expect(storefrontItemName('Cafe con leche')).toBe('Café con leche')
    expect(storefrontItemName('Café con leche')).toBe('Café con leche')
    expect(storefrontItemName('Cafe especial')).toBe('Cafe especial')
    expect(storefrontCategoryName('Cafe')).toBe('Café')
    expect(storefrontCategoryName('Cafe especial')).toBe('Cafe especial')
  })
})
