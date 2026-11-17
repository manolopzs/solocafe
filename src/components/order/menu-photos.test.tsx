/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { ProductCard } from './product-card'
import { ItemSheet } from './item-sheet'
import { CategoryTabs } from './category-tabs'
import type { MenuItem } from '@/types'

const item: MenuItem = {
  id: 'drink', shop_id: 'shop', category_id: 'coffee', name: 'Cafe con leche',
  description: null, price_cents: 300, image_url: null, is_active: true,
  is_86ed: false, prep_time_min: 2, sort_order: 0, created_at: '', updated_at: '',
}
const formatPrice = (cents: number) => `${(cents / 100).toFixed(2).replace('.', ',')} €`

test.each([
  ['Latte', 'latte'],
  ['Cortado', 'cortado'],
  ['Cafe con leche', 'cafe-con-leche'],
])('card and sheet show the licensed %s cut-out on a surface tile', (name, file) => {
  const drink = { ...item, name }
  const card = render(<ProductCard item={drink} isFavorite={false} showFavorite={false}
    onClick={() => {}} onToggleFavorite={() => {}} formatPrice={formatPrice} />)
  const cardImage = card.container.querySelector('img')
  expect(cardImage?.getAttribute('src')).toContain(encodeURIComponent(`/menu/cutouts/${file}.png`))
  expect(cardImage?.className).toMatch(/object-contain/)
  card.unmount()
  const sheet = render(<ItemSheet item={drink} groups={[]} optionsForGroup={() => []}
    onClose={() => {}} onAdd={() => {}} formatPrice={formatPrice} />)
  const sheetImage = sheet.container.querySelector('img')
  expect(sheetImage?.getAttribute('src')).toContain(encodeURIComponent(`/menu/cutouts/${file}.png`))
})

test('displays the accent without changing quick-add or price formatting', () => {
  const onQuickAdd = jest.fn()
  const onClick = jest.fn()
  render(<ProductCard item={item} isFavorite={false} showFavorite={false}
    onClick={onClick} onQuickAdd={onQuickAdd} onToggleFavorite={() => {}} formatPrice={formatPrice} />)
  expect(screen.getByRole('heading', { name: 'Café con leche', hidden: true })).toBeInTheDocument()
  expect(screen.getByText('3,00 €')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Añadir Café con leche' }))
  expect(onQuickAdd).toHaveBeenCalledTimes(1)
  expect(onClick).not.toHaveBeenCalled()
})

test('card and sheet keep an existing photo instead of the generic fallback', () => {
  const drink = { ...item, image_url: '/custom-photo.jpg' }
  const card = render(<ProductCard item={drink} isFavorite={false} showFavorite={false}
    onClick={() => {}} onToggleFavorite={() => {}} formatPrice={formatPrice} />)
  expect(card.container.querySelector('img')?.getAttribute('src')).toContain(encodeURIComponent('/custom-photo.jpg'))
  expect(card.container.querySelector('img')?.style.objectPosition).toBe('')
  card.unmount()
  const sheet = render(<ItemSheet item={drink} groups={[]} optionsForGroup={() => []}
    onClose={() => {}} onAdd={() => {}} formatPrice={formatPrice} />)
  expect(sheet.container.querySelector('img')?.getAttribute('src')).toContain(encodeURIComponent('/custom-photo.jpg'))
  expect(sheet.container.querySelector('img')?.style.objectPosition).toBe('')
  expect(screen.getByRole('heading', { name: 'Café con leche', hidden: true })).toBeInTheDocument()
})

test('category tabs display Café without mutating the stored category', () => {
  const category = { id: 'coffee', shop_id: 'shop', name: 'Cafe', sort_order: 0, is_active: true, created_at: '' }
  render(<CategoryTabs categories={[category]} activeId="" onSelect={() => {}} />)
  expect(screen.getByRole('button', { name: 'Café' })).toBeInTheDocument()
  expect(category.name).toBe('Cafe')
})

test('puts name and price under the tile and the + disc 8px from its corner', () => {
  const onQuickAdd = jest.fn()
  const onClick = jest.fn()
  const { container } = render(
    <ProductCard item={item} isFavorite={false} showFavorite={false} onClick={onClick}
      onQuickAdd={onQuickAdd} onToggleFavorite={() => {}} formatPrice={formatPrice} />,
  )
  const tile = container.querySelector('.aspect-square')!
  const price = screen.getByText('3,00 €')
  const name = screen.getByRole('heading', { name: 'Café con leche', hidden: true })
  expect(tile).not.toContainElement(price)
  expect(tile).not.toContainElement(name)
  expect(name).not.toContainElement(price)
  expect(price.className).toMatch(/whitespace-nowrap/)
  expect(name.className).toMatch(/line-clamp-2/)

  const quickAdd = screen.getByRole('button', { name: 'Añadir Café con leche' })
  expect(tile).toContainElement(quickAdd)
  expect(quickAdd.parentElement?.parentElement?.className).toMatch(/bottom-2 right-2/)
  fireEvent.click(quickAdd)
  expect(onQuickAdd).toHaveBeenCalledTimes(1)
  expect(onClick).not.toHaveBeenCalled()
})

test('an item with no photo and no cut-out shows a coffee icon on the tile, never a colour block', () => {
  const noPhoto: MenuItem = { ...item, id: 'tea', name: 'Te verde', price_cents: 180 }
  const { container } = render(
    <ProductCard item={noPhoto} isFavorite={false} showFavorite={false} onClick={() => {}}
      onQuickAdd={() => {}} onToggleFavorite={() => {}} formatPrice={formatPrice} />,
  )
  expect(container.querySelector('img')).toBeNull()
  expect(container.querySelector('.aspect-square svg')).not.toBeNull()
  expect(screen.getByText('1,80 €')).toBeInTheDocument()
})
