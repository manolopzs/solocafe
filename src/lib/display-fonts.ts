export const DISPLAY_FONTS = [
  { key: 'dm_sans', label: 'DM Sans', variable: '--font-dm-sans' },
  { key: 'fraunces', label: 'Fraunces', variable: '--font-fraunces' },
  { key: 'literata', label: 'Literata', variable: '--font-literata' },
  { key: 'newsreader', label: 'Newsreader', variable: '--font-newsreader' },
  { key: 'libre_baskerville', label: 'Libre Baskerville', variable: '--font-libre-baskerville' },
] as const

export function displayFontFamily(key: string | null | undefined) {
  const match = DISPLAY_FONTS.find((font) => font.key === key) ?? DISPLAY_FONTS[0]
  return `var(${match.variable})`
}
