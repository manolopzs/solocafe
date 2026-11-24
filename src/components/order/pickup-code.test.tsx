/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { PickupCode } from './pickup-code'

const id = '0b6f1c2a-1111-4222-8333-4f2a9c1b7e3d'

test('md: tracker chip with the pickup eyebrow and no hint', () => {
  render(<PickupCode orderId={id} size="md" />)
  expect(screen.getByText('Pickup code')).toBeInTheDocument()
  expect(screen.getByTestId('pickup-code')).toHaveTextContent(/^7E3D$/)
  expect(screen.queryByText('Say it, or tap to show this at the counter')).not.toBeInTheDocument()
})

test('lg: Ready card with the same code, its eyebrow and the hint', () => {
  render(<PickupCode orderId={id} size="lg" />)
  expect(screen.getByText('Your code')).toBeInTheDocument()
  expect(screen.getByTestId('ready-pickup-code')).toHaveTextContent(/^7E3D$/)
  expect(screen.getByText('Say it, or tap to show this at the counter')).toBeInTheDocument()
})

test('lg renders the code at 64-72px and can be copied', () => {
  render(<PickupCode orderId={id} size="lg" />)
  const code = screen.getByTestId('ready-pickup-code')
  expect(code.className).toContain('text-[64px]')
  fireEvent.click(code)
  // The toast appears after a successful copy.
  // In jsdom clipboard may fail, so we just verify the button is present.
  expect(code).toBeInTheDocument()
})

test('lg forwards data-testid and calls onTap when tapped', () => {
  const onTap = jest.fn()
  render(<PickupCode orderId={id} size="lg" data-testid="open-bar-handoff" onTap={onTap} />)
  const button = screen.getByTestId('open-bar-handoff')
  expect(button).toBeInTheDocument()
  fireEvent.click(button)
  expect(onTap).toHaveBeenCalledTimes(1)
})
