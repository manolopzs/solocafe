export const SITE_NAME = 'Solo Café'
/** Customer home: the only shop's menu, or the shop list when there are several. */
export const CUSTOMER_HOME_PATH = '/inicio'
export const SITE_DESCRIPTION = 'Pide tu café desde el móvil y recógelo sin colas.'
/** Cream page background and dark-brown brand color from globals.css. */
export const SITE_BACKGROUND_COLOR = '#fffbf7'
export const SITE_BRAND_COLOR = '#3d2b1f'

/** Link preview image (public/og-image.png). */
export const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Solo Café: pide tu café y recógelo sin colas',
}

/** Shared Open Graph fields, so a page that sets its own title keeps the image and locale. */
export const BASE_OPEN_GRAPH = {
  type: 'website' as const,
  locale: 'es_ES',
  siteName: SITE_NAME,
  images: [OG_IMAGE],
}

export function siteUrl(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_APP_URL
  if (!raw) return undefined
  try {
    return new URL(raw)
  } catch {
    return undefined
  }
}

export function storefrontTitle(shopName: string | null | undefined) {
  const name = shopName?.trim()
  return name ? `${name} · ${SITE_NAME}` : SITE_NAME
}
