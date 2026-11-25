export function vibrate(pattern: number | number[] = 10) {
  if (typeof window === 'undefined') return
  try {
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  } catch {
    // Ignore matchMedia failures and continue without vibration.
  }
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}
