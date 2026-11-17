/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ProductCard } from './product-card'
import { BagBar } from './bag-bar'
import { useShopCart } from './hooks/use-shop-cart'
import type { MenuItem } from '@/types'

const item: MenuItem = {
  id: 'drink', shop_id: 'shop', category_id: 'coffee', name: 'Cafe con leche',
  description: null, price_cents: 300, image_url: null, is_active: true,
  is_86ed: false, prep_time_min: 2, sort_order: 0, created_at: '', updated_at: '',
}
const formatPrice = (cents: number) => `${(cents / 100).toFixed(2).replace('.', ',')} €`

function card(props: Partial<Parameters<typeof ProductCard>[0]> = {}) {
  return render(
    <ProductCard item={item} isFavorite={false} showFavorite={false} onClick={() => {}}
      onToggleFavorite={() => {}} formatPrice={formatPrice} {...props} />,
  )
}

/** Same wiring as OrderPageClient: the card reflects the bag line without options. */
function CardWithBag({ shopId }: { shopId: string }) {
  const cart = useShopCart(shopId)
  const index = cart.lines.findIndex((line) => line.itemId === item.id && line.modifierIds.length === 0)
  const quantity = index === -1 ? 0 : cart.lines[index].quantity
  return (
    <ProductCard item={item} isFavorite={false} showFavorite={false} onClick={() => {}}
      onToggleFavorite={() => {}} formatPrice={formatPrice}
      quantity={quantity}
      onQuickAdd={() => cart.add(item.id, 1, [])}
      onDecrement={() => cart.setQuantity(index, quantity - 1)} />
  )
}

beforeEach(() => window.localStorage.clear())

test('shows the + disc until the item is in the bag', () => {
  card({ onQuickAdd: () => {}, onDecrement: () => {} })
  expect(screen.getByRole('button', { name: 'Añadir Café con leche' })).toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Cantidad de Café con leche' })).not.toBeInTheDocument()
})

test('shows a stepper with the bag quantity and keeps the full price visible', () => {
  const onQuickAdd = jest.fn()
  const onDecrement = jest.fn()
  card({ quantity: 2, onQuickAdd, onDecrement })
  const group = screen.getByRole('group', { name: 'Cantidad de Café con leche' })
  expect(group).toHaveTextContent('2')
  expect(screen.getByText('3,00 €').textContent).toBe('3,00 €')
  fireEvent.click(screen.getByRole('button', { name: 'Añadir Café con leche' }))
  fireEvent.click(screen.getByRole('button', { name: 'Quitar Café con leche' }))
  expect(onQuickAdd).toHaveBeenCalledTimes(1)
  expect(onDecrement).toHaveBeenCalledTimes(1)
})

test('items with options have no quick-add and keep opening the item sheet', () => {
  const onClick = jest.fn()
  card({ customizable: true, quantity: 1, onQuickAdd: () => {}, onDecrement: () => {}, onClick })
  expect(screen.queryByRole('button', { name: /^Añadir/ })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Café con leche' }))
  expect(onClick).toHaveBeenCalledTimes(1)
})

test('add, increment and decrement to zero follow the real bag', () => {
  render(<CardWithBag shopId="stepper-shop" />)
  act(() => fireEvent.click(screen.getByRole('button', { name: 'Añadir Café con leche' })))
  expect(screen.getByTestId('quick-add-quantity')).toHaveTextContent('1')

  act(() => fireEvent.click(screen.getByRole('button', { name: 'Añadir Café con leche' })))
  expect(screen.getByTestId('quick-add-quantity')).toHaveTextContent('2')

  act(() => fireEvent.click(screen.getByRole('button', { name: 'Quitar Café con leche' })))
  expect(screen.getByTestId('quick-add-quantity')).toHaveTextContent('1')

  act(() => fireEvent.click(screen.getByRole('button', { name: 'Quitar Café con leche' })))
  expect(screen.queryByTestId('quick-add-quantity')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Añadir Café con leche' })).toBeInTheDocument()
  expect(JSON.parse(window.localStorage.getItem('solocafe.cart.stepper-shop') ?? '{}').lines).toEqual([])
})

test('the bag bar slides up once and its badge pops on every add', () => {
  const { rerender } = render(<BagBar count={1} total="3,00 €" onOpen={() => {}} />)
  const bar = () => screen.getByRole('button', { name: /Ver pedido/ })
  const badge = () => screen.getByText('1', { selector: 'span' })
  expect(bar().className).toMatch(/animate-bar-in/)
  expect(badge().className).not.toMatch(/animate-badge-pop/)
  rerender(<BagBar count={2} total="6,00 €" onOpen={() => {}} pulseKey={1} />)
  expect(screen.getByText('2', { selector: 'span' }).className).toMatch(/animate-badge-pop/)
  expect(bar()).toHaveAttribute('data-pulse', 'true')
})
