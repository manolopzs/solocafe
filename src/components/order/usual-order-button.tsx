'use client'

import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import type { UsualOrder } from '@/types'

export function UsualOrderButton({
  usual,
  onOrder,
}: {
  usual: UsualOrder
  onOrder: () => void
}) {
  const image = usual.items.find((item) => item.image_url)?.image_url

  return (
    <section className="mx-auto max-w-3xl px-4 pt-4 sm:px-5">
      <button
        type="button"
        onClick={onOrder}
        disabled={!usual.can_reorder}
        className="flex min-h-[4.5rem] w-full items-center gap-4 rounded-3xl bg-primary p-3 text-left text-primary-foreground shadow-md transition-transform enabled:active:scale-[0.99] disabled:opacity-70 sm:p-4"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/10">
          {image ? (
            <Image src={image} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon name="coffee" className="h-7 w-7" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Tu de siempre</p>
          <p className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug">{usual.label}</p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            {usual.can_reorder ? 'Pedirlo otra vez' : 'Ya no está disponible'}
          </p>
        </div>
        <Icon name="arrow-right" className="h-5 w-5 shrink-0" />
      </button>
    </section>
  )
}
