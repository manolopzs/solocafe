'use client'

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { KdsAlerts } from './kds-alerts'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const STORAGE_KEY = 'solo-kds-alerts-enabled'

function readAccepted() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

function subscribe(onChange: () => void) {
  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

function acceptAlerts() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, 'true')
  window.dispatchEvent(
    new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'true' })
  )
}

function findAlertsButton(): HTMLButtonElement | null {
  for (const button of document.querySelectorAll('button')) {
    if (button.textContent?.includes('Avisos apagados')) {
      return button
    }
  }
  return null
}

export function KdsAlertGate({ children }: { children: ReactNode }) {
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => false)
  const autoEnabledRef = useRef(false)

  useEffect(() => {
    if (!accepted || autoEnabledRef.current) return
    autoEnabledRef.current = true
    const id = window.setTimeout(() => {
      const button = findAlertsButton()
      if (button) button.click()
    }, 0)
    return () => window.clearTimeout(id)
  }, [accepted])

  if (!accepted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Icon name="volume-2" className="h-8 w-8 text-accent" />
          </div>
          <h2 className="mt-6 font-sans text-2xl font-semibold tracking-tight text-foreground">
            Activa los avisos de cocina
          </h2>
          <p className="mt-3 text-muted-foreground">
            Escucha un sonido y recibe una notificación cuando entra un pedido nuevo.
          </p>
          <Button
            size="lg"
            className="mt-8 w-full"
            onClick={() => {
              void KdsAlerts.enable()
              acceptAlerts()
            }}
          >
            Activar avisos
          </Button>
        </div>
      </div>
    )
  }

  return children
}
