import type { CSSProperties } from 'react'
import { displayFontFamily } from '@/lib/display-fonts'

function channels(hex: string): [number, number, number] | null {
  const raw = hex.trim().replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((char) => char + char).join('') : raw
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16)) as [number, number, number]
}

export function readableOn(hex: string) {
  const rgb = channels(hex)
  if (!rgb) return '#ffffff'
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.42 ? '#2a211c' : '#ffffff'
}

function shade(hex: string, amount: number) {
  const rgb = channels(hex)
  if (!rgb) return hex
  const next = rgb.map((value) => Math.max(0, Math.min(255, Math.round(value * (1 - amount)))))
  return `#${next.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

export function shopThemeVars(brandColor: string, displayFont?: string | null): CSSProperties {
  const foreground = readableOn(brandColor)
  return {
    '--accent': brandColor,
    '--accent-foreground': foreground,
    '--ring': brandColor,
    '--primary': brandColor,
    '--primary-foreground': foreground,
    '--primary-hover': shade(brandColor, 0.12),
    '--font-display': displayFontFamily(displayFont),
  } as CSSProperties
}
