'use client'

import { useEffect, useState } from 'react'

/**
 * - `active`: the screen will stay on.
 * - `unsupported`: the browser has no Screen Wake Lock (e.g. older iOS).
 * - `denied`: the browser refused (battery saver, permissions, not visible).
 * - `idle`: not requested (disabled or not yet resolved).
 */
export type WakeLockState = 'idle' | 'active' | 'unsupported' | 'denied'

type Sentinel = { release: () => Promise<void>; addEventListener?: (type: 'release', cb: () => void) => void }
type WakeLockApi = { request: (type: 'screen') => Promise<Sentinel> }

function wakeLockApi(): WakeLockApi | null {
  if (typeof navigator === 'undefined') return null
  const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock
  return api && typeof api.request === 'function' ? api : null
}

/**
 * Keeps the screen on while `enabled`. Releases the lock on unmount and when the
 * page is hidden, and asks again when it is visible. Never throws: without
 * support it just reports `unsupported` so the UI can change its hint.
 */
export function useWakeLock(enabled: boolean): WakeLockState {
  const [state, setState] = useState<WakeLockState>(() => (wakeLockApi() ? 'idle' : 'unsupported'))

  useEffect(() => {
    const api = wakeLockApi()
    if (!enabled || !api) return

    let sentinel: Sentinel | null = null
    let disposed = false

    const release = () => {
      const current = sentinel
      sentinel = null
      if (current) current.release().catch(() => {})
    }

    const request = async () => {
      if (disposed || sentinel || document.visibilityState !== 'visible') return
      try {
        const lock = await api.request('screen')
        if (disposed) {
          lock.release().catch(() => {})
          return
        }
        sentinel = lock
        lock.addEventListener?.('release', () => {
          if (sentinel === lock) sentinel = null
        })
        setState('active')
      } catch {
        if (!disposed) setState('denied')
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request()
      else release()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibility)
      release()
      setState('idle')
    }
  }, [enabled])

  return state
}
