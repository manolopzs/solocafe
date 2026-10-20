import Link from 'next/link'
import type { LoyaltyProgress } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export function StampCard({
  loyalty,
  compact = false,
}: {
  loyalty: LoyaltyProgress
  compact?: boolean
}) {
  const required = Math.max(loyalty.stamps_required, 1)
  const filled = Math.min(Math.max(loyalty.stamps, 0), required)
  const remaining = Math.max(required - filled, 0)
  const showDots = required <= 12

  return (
    <Card variant="outline" className="overflow-hidden">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tarjeta de sellos</p>
            {compact ? (
              <p className="mt-1 font-semibold text-foreground">{loyalty.shop_name}</p>
            ) : (
              <p className="mt-1 text-lg font-semibold text-foreground">
                {filled} de {required} sellos
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
            <Icon name="coffee" className="h-5 w-5" />
          </div>
        </div>

        {compact && (
          <p className="text-sm font-medium text-foreground">
            {filled} de {required} sellos
          </p>
        )}

        {showDots ? (
          <div className="flex flex-wrap gap-1.5" aria-hidden="true">
            {Array.from({ length: required }, (_, index) => (
              <span
                key={index}
                className={[
                  'h-3.5 w-3.5 rounded-full',
                  index < filled ? 'bg-foreground' : 'border border-border bg-surface',
                ].join(' ')}
              />
            ))}
          </div>
        ) : (
          <div className="h-2 overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div className="h-full rounded-full bg-foreground" style={{ width: `${(filled / required) * 100}%` }} />
          </div>
        )}

        <p className="text-sm text-foreground">
          Recompensa: <span className="font-medium">{loyalty.reward_text}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {loyalty.can_redeem
            ? 'Ya puedes canjearla en tu próximo pedido.'
            : remaining === 1
              ? 'Te falta 1 sello.'
              : `Te faltan ${remaining} sellos.`}
        </p>
        {compact && loyalty.shop_slug && (
          <Link href={`/${loyalty.shop_slug}`} className="inline-block text-sm font-medium text-foreground hover:underline">
            Pedir en {loyalty.shop_name}
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
