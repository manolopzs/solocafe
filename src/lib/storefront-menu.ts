import type { MenuItem } from '@/types'

type MenuItemImage = {
  src: string
  cardPosition?: string
  sheetPosition?: string
}

export function getMenuItemImage(item: Pick<MenuItem, 'name' | 'image_url'>): MenuItemImage | null {
  if (item.image_url) return { src: item.image_url }

  const name = item.name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  switch (name) {
    case 'latte':
      return { src: '/menu/latte.jpg', cardPosition: '72% 62%', sheetPosition: '78% 55%' }
    case 'cortado':
      return { src: '/menu/cortado.jpg', cardPosition: 'center', sheetPosition: '50% 40%' }
    case 'cafe con leche':
      return { src: '/menu/cafe-con-leche.jpg', cardPosition: 'center', sheetPosition: 'center' }
    default:
      return null
  }
}

const CUTOUTS: Record<string, string> = {
  latte: '/menu/cutouts/latte.png',
  cortado: '/menu/cutouts/cortado.png',
  'cafe con leche': '/menu/cutouts/cafe-con-leche.png',
}

function normalizedName(name: string) {
  return name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * A licensed cut-out (cup and saucer on transparent, see public/menu/cutouts/CREDITS.md)
 * for a menu item, shown on a surface tile. Only when the shop hasn't uploaded its own photo.
 */
export function getMenuItemCutout(item: Pick<MenuItem, 'name' | 'image_url'>): string | null {
  if (item.image_url) return null
  return CUTOUTS[normalizedName(item.name)] ?? null
}

/** Up to `limit` cut-outs from a shop's real menu, in menu order, for its Inicio card. */
export function shopCutouts(items: Pick<MenuItem, 'name' | 'image_url' | 'is_active' | 'is_86ed' | 'sort_order'>[], limit = 3): string[] {
  const seen = new Set<string>()
  for (const item of [...items].sort((a, b) => a.sort_order - b.sort_order)) {
    if (!item.is_active) continue
    const cutout = getMenuItemCutout(item)
    if (cutout) seen.add(cutout)
    if (seen.size === limit) break
  }
  return [...seen]
}

export function storefrontItemName(name: string): string {
  return name === 'Cafe con leche' ? 'Café con leche' : name
}

export function storefrontCategoryName(name: string): string {
  return name === 'Cafe' ? 'Café' : name
}
