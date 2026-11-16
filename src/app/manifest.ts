import type { MetadataRoute } from 'next'
import { SITE_BACKGROUND_COLOR, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: 'es-ES',
    dir: 'ltr',
    // Customers install from a shop or Explorar; never open the owner landing page.
    start_url: '/explore',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: SITE_BACKGROUND_COLOR,
    theme_color: SITE_BACKGROUND_COLOR,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
