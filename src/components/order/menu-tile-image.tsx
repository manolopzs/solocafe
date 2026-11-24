import Image from 'next/image'
import { PhosphorIcon } from '@/components/icons/phosphor'
import { getMenuItemCutout, getMenuItemImage } from '@/lib/storefront-menu'
import type { MenuItem } from '@/types'

/**
 * What a menu item shows on its surface tile (foundation/SPEC.md section 5):
 * the shop's own photo (cover), else a licensed cut-out at 82% (inset 9%),
 * else a 28px coffee icon. Never a brand-colour block.
 */
export function MenuTileImage({
  item,
  sizes,
  variant = 'card',
  iconClassName = 'h-7 w-7',
}: {
  item: Pick<MenuItem, 'name' | 'image_url'>
  sizes: string
  variant?: 'card' | 'sheet'
  iconClassName?: string
}) {
  const cutout = getMenuItemCutout(item)
  if (cutout) {
    return (
      <Image
        src={cutout}
        alt=""
        fill
        sizes={sizes}
        data-kind="cutout"
        className="pointer-events-none !inset-[9%] !h-[82%] !w-[82%] object-contain"
      />
    )
  }
  const photo = getMenuItemImage(item)
  if (photo) {
    return (
      <Image
        src={photo.src}
        style={{ objectPosition: variant === 'card' ? photo.cardPosition : photo.sheetPosition }}
        alt=""
        fill
        sizes={sizes}
        className="pointer-events-none object-cover"
      />
    )
  }
  return (
    <div className="pointer-events-none flex h-full w-full items-center justify-center text-muted-foreground">
      <PhosphorIcon name="coffee" className={iconClassName} />
    </div>
  )
}
