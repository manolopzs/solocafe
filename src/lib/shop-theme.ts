import type { CSSProperties } from 'react'
import { displayFontFamily } from '@/lib/display-fonts'

// Solo Cafe owns the neutrals, the sky fields and the CTA. A shop's brand_color is only an
// identity touch (cover stripe, Explore tile) and only when it is readable on the canvas.
export const CANVAS = '#fdf7f2'
export const ESPRESSO = '#241d1a'
export const NEUTRAL_TILE = { background: '#efdfd2', foreground: ESPRESSO } as const

const MIN_UI_CONTRAST = 3
const MIN_TEXT_CONTRAST = 4.5

function channels(hex: string): [number, number, number] | null {
  const raw = hex.trim().replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((char) => char + char).join('') : raw
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16)) as [number, number, number]
}

function luminance(hex: string): number | null {
  const rgb = channels(hex)
  if (!rgb) return null
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number | null {
  const la = luminance(a)
  const lb = luminance(b)
  if (la === null || lb === null) return null
  const [light, dark] = la > lb ? [la, lb] : [lb, la]
  return (light + 0.05) / (dark + 0.05)
}

export function readableOn(hex: string) {
  const onDark = contrastRatio(hex, '#ffffff') ?? 0
  const onLight = contrastRatio(hex, ESPRESSO) ?? 0
  return onLight > onDark ? ESPRESSO : '#ffffff'
}

export type IdentityColor = { background: string; foreground: string }

/** The shop's brand colour for identity surfaces, or null when unset or not readable. */
export function brandIdentityColor(brandColor?: string | null): IdentityColor | null {
  if (!brandColor || !channels(brandColor)) return null
  const foreground = readableOn(brandColor)
  const againstCanvas = contrastRatio(brandColor, CANVAS) ?? 0
  const withLabel = contrastRatio(brandColor, foreground) ?? 0
  if (againstCanvas < MIN_UI_CONTRAST || withLabel < MIN_TEXT_CONTRAST) return null
  return { background: brandColor, foreground }
}

export function shopThemeVars(displayFont?: string | null): CSSProperties {
  return {
    '--font-display': displayFontFamily(displayFont),
  } as CSSProperties
}
