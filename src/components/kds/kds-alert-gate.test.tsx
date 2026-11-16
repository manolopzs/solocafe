/** @jest-environment jsdom */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { KdsAlertGate } from './kds-alert-gate'

jest.mock('./kds-alerts', () => ({
  KdsAlerts: {
    enable: jest.fn(() => Promise.resolve('granted')),
    register: jest.fn(() => Promise.resolve()),
  },
}))

function mockStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: () => {
      store = {}
    },
    _store: () => store,
  }
}

describe('KdsAlertGate', () => {
  let storage: ReturnType<typeof mockStorage>

  beforeEach(() => {
    storage = mockStorage()
    Object.defineProperty(window, 'localStorage', {
      value: storage,
      configurable: true,
    })
  })

  it('shows a blocking prompt on first open', async () => {
    render(
      <KdsAlertGate>
        <div data-testid="kitchen">Kitchen</div>
      </KdsAlertGate>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Activar avisos/i })).toBeInTheDocument()
    })
    expect(screen.queryByTestId('kitchen')).not.toBeInTheDocument()
  })

  it('enables alerts, reveals the kitchen and auto-clicks the alerts toggle', async () => {
    let clicked = false

    render(
      <KdsAlertGate>
        <button type="button" onClick={() => { clicked = true }}>
          Avisos apagados
        </button>
        <div data-testid="kitchen">Kitchen</div>
      </KdsAlertGate>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Activar avisos/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Activar avisos/i }))

    await waitFor(() => {
      expect(screen.getByTestId('kitchen')).toBeInTheDocument()
    })
    expect(clicked).toBe(true)
    expect(storage._store()['solo-kds-alerts-enabled']).toBe('true')
  })

  it('skips the prompt when alerts were already accepted', async () => {
    storage.setItem('solo-kds-alerts-enabled', 'true')

    render(
      <KdsAlertGate>
        <div data-testid="kitchen">Kitchen</div>
      </KdsAlertGate>
    )

    await waitFor(() => {
      expect(screen.getByTestId('kitchen')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /Activar avisos/i })).not.toBeInTheDocument()
  })
})
