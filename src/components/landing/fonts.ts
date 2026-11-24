import { Outfit, Fraunces } from 'next/font/google'

// Variable fonts, one preloaded file each. display 'optional' keeps the headline (the LCP element) from
// repainting when a font arrives late; on a slow first visit the size-adjusted fallback stays for that view.
export const outfit = Outfit({
  variable: '--font-landing-display',
  subsets: ['latin'],
  display: 'optional',
})

export const fraunces = Fraunces({
  variable: '--font-landing-accent',
  subsets: ['latin'],
  style: ['italic'],
  display: 'optional',
})
