/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { PickupCode } from './pickup-code'

const id = '0b6f1c2a-1111-4222-8333-4f2a9c1b7e3d'
let writeText: jest.Mock
let vibrateMock: jest.Mock

beforeEach(() => {
  writeText = jest.fn().mockResolvedValue(undefined)
  vibrateMock = jest.fn()
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrateMock })
})

afterEach(() => jest.useRealTimers())

test('md: tracker chip with the pickup eyebrow and no hint', () => {
  render(<PickupCode orderId={id} size="md" />)
  expect(screen.getByText('Pickup code')).toBeInTheDocument()
  expect(screen.getByText('Pickup code')).not.toHaveClass('uppercase')
  expect(screen.getByTestId('pickup-code')).toHaveTextContent(/^7E3D$/)
  expect(screen.queryByText('Say it, or tap to show this at the counter')).not.toBeInTheDocument()
})

test('lg: Ready card with the same code, its eyebrow and the hint', () => {
  render(<PickupCode orderId={id} size="lg" />)
  expect(screen.getByText('Your code')).toBeInTheDocument()
  expect(screen.getByText('Your code')).not.toHaveClass('uppercase')
  expect(screen.getByTestId('ready-pickup-code')).toHaveTextContent(/^7E3D$/)
  expect(screen.getByText('Say it, or tap to show this at the counter')).toBeInTheDocument()
  expect(screen.getByTestId('ready-pickup-code').className).toContain('text-[64px]')
})

test('lg tap and Enter only open the handoff, without copying', () => {
  const onTap = jest.fn()
  render(<PickupCode orderId={id} size="lg" data-testid="open-bar-handoff" onTap={onTap} />)
  const button = screen.getByTestId('open-bar-handoff')
  fireEvent.click(button)
  fireEvent.keyDown(button, { key: 'Enter' })
  expect(onTap).toHaveBeenCalledTimes(2)
  expect(writeText).not.toHaveBeenCalled()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

test('Copy code copies and vibrates without opening the handoff', async () => {
  jest.useFakeTimers()
  const onTap = jest.fn()
  render(<PickupCode orderId={id} size="lg" onTap={onTap} />)
  fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
  await act(async () => {})

  expect(writeText).toHaveBeenCalledWith('7E3D')
  expect(vibrateMock).toHaveBeenCalledWith(10)
  expect(onTap).not.toHaveBeenCalled()
  const toast = screen.getByRole('status')
  expect(toast).toHaveTextContent('Copied')
  expect(toast).not.toHaveClass('absolute')
  expect(screen.getByTestId('ready-pickup-code').compareDocumentPosition(toast) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

  act(() => jest.advanceTimersByTime(1199))
  expect(screen.getByRole('status')).toBeInTheDocument()
  act(() => jest.advanceTimersByTime(1))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
