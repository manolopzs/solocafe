/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { BarHandoff } from './bar-handoff'
import { pickupCode } from '@/lib/pickup-code'

const ORDER_ID = '0b9af000-0000-4000-8000-000000000001'

function renderHandoff(onClose = jest.fn()) {
  render(
    <BarHandoff
      orderId={ORDER_ID}
      shopName="Solo cafe"
      customerName="Lucía"
      items={[{ id: 'i1', quantity: 1, name: 'Latte' }]}
      onClose={onClose}
    />,
  )
  return onClose
}

afterEach(() => {
  delete (navigator as unknown as { wakeLock?: unknown }).wakeLock
})

describe('BarHandoff', () => {
  it('shows the code at 108px with the name, the items and only the shop name in the header', () => {
    renderHandoff()
    const code = screen.getByTestId('bar-pickup-code')
    expect(code).toHaveTextContent(pickupCode(ORDER_ID))
    expect(code.className).toContain('text-[108px]')
    expect(screen.getByText('Lucía')).toBeInTheDocument()
    expect(screen.getByText('1 × Latte')).toBeInTheDocument()
    expect(screen.getByText('Solo cafe')).toBeInTheDocument()
    expect(screen.queryByText('Cerrar')).not.toBeInTheDocument()
  })

  it('has one full-width Volver fixed at safe area + 12', () => {
    const onClose = renderHandoff()
    const back = screen.getByRole('button', { name: 'Volver' })
    expect(back.className).toContain('w-full')
    expect(back.className).toContain('h-12')
    expect(back.parentElement?.className).toContain('bottom-[calc(env(safe-area-inset-bottom)+12px)]')
    fireEvent.click(back)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('places the code group at the optical centre between the header and Volver', () => {
    renderHandoff()
    const group = screen.getByTestId('bar-handoff-group')
    expect(group.className).toContain('flex-1')
    const spacers = Array.from(group.children).filter((child) => child.getAttribute('aria-hidden') === 'true')
    expect(spacers.map((spacer) => spacer.className)).toEqual(['min-h-6 flex-1', 'min-h-6 flex-[2]'])
    expect(group.contains(screen.getByTestId('bar-pickup-code'))).toBe(true)
  })

  it('closes with Escape', () => {
    const onClose = renderHandoff()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('without Wake Lock it does not promise the screen stays on', () => {
    renderHandoff()
    expect(screen.getByTestId('bar-handoff')).toHaveAttribute('data-wake-lock', 'unsupported')
    expect(screen.queryByText(/no se apaga/)).not.toBeInTheDocument()
  })

  it('with Wake Lock it says the screen stays on', async () => {
    const release = jest.fn(async () => undefined)
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: jest.fn(async () => ({ release })) },
    })
    renderHandoff()
    await act(async () => {})
    expect(screen.getByText(/La pantalla no se apaga mientras esté abierta/)).toBeInTheDocument()
  })
})
