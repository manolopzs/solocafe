/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { PickupCode } from './pickup-code'

const id = '0b6f1c2a-1111-4222-8333-4f2a9c1b7e3d'

test('md: tracker chip with the pickup eyebrow and no hint', () => {
  render(<PickupCode orderId={id} size="md" />)
  expect(screen.getByText('Código de recogida')).toBeInTheDocument()
  expect(screen.getByTestId('pickup-code')).toHaveTextContent(/^7E3D$/)
  expect(screen.queryByText('Dilo o enséñalo en la barra')).not.toBeInTheDocument()
})

test('lg: Listo card with the same code, its eyebrow and the hint', () => {
  render(<PickupCode orderId={id} size="lg" />)
  expect(screen.getByText('Tu código')).toBeInTheDocument()
  expect(screen.getByTestId('ready-pickup-code')).toHaveTextContent(/^7E3D$/)
  expect(screen.getByText('Dilo o enséñalo en la barra')).toBeInTheDocument()
})
