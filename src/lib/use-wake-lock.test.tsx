/** @jest-environment jsdom */
import { act, render, screen } from '@testing-library/react'
import { useWakeLock } from './use-wake-lock'

function Probe({ enabled = true }: { enabled?: boolean }) {
  return <p data-testid="state">{useWakeLock(enabled)}</p>
}

function setVisibility(value: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => value })
  document.dispatchEvent(new Event('visibilitychange'))
}

function installWakeLock(request: jest.Mock) {
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } })
}

function sentinel() {
  return { release: jest.fn(async () => undefined), addEventListener: jest.fn() }
}

afterEach(() => {
  delete (navigator as unknown as { wakeLock?: unknown }).wakeLock
  setVisibility('visible')
})

describe('useWakeLock', () => {
  it('reports unsupported and does nothing when the browser has no Wake Lock', () => {
    render(<Probe />)
    expect(screen.getByTestId('state')).toHaveTextContent('unsupported')
  })

  it('keeps the screen on and releases the lock on unmount', async () => {
    const lock = sentinel()
    const request = jest.fn(async () => lock)
    installWakeLock(request)
    const { unmount } = render(<Probe />)
    await act(async () => {})
    expect(request).toHaveBeenCalledWith('screen')
    expect(screen.getByTestId('state')).toHaveTextContent('active')
    unmount()
    expect(lock.release).toHaveBeenCalledTimes(1)
  })

  it('releases when the page is hidden and asks again when it is visible', async () => {
    const first = sentinel()
    const second = sentinel()
    const request = jest.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second)
    installWakeLock(request)
    render(<Probe />)
    await act(async () => {})
    await act(async () => setVisibility('hidden'))
    expect(first.release).toHaveBeenCalledTimes(1)
    await act(async () => setVisibility('visible'))
    expect(request).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('state')).toHaveTextContent('active')
  })

  it('falls back to denied when the request is refused', async () => {
    installWakeLock(jest.fn(async () => Promise.reject(new Error('NotAllowedError'))))
    render(<Probe />)
    await act(async () => {})
    expect(screen.getByTestId('state')).toHaveTextContent('denied')
  })

  it('does not ask while disabled', async () => {
    const request = jest.fn(async () => sentinel())
    installWakeLock(request)
    render(<Probe enabled={false} />)
    await act(async () => {})
    expect(request).not.toHaveBeenCalled()
  })
})
