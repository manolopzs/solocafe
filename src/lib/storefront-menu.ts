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

export function storefrontItemName(name: string): string {
  return name === 'Cafe con leche' ? 'Café con leche' : name
}

export function storefrontCategoryName(name: string): string {
  return name === 'Cafe' ? 'Café' : name
}
