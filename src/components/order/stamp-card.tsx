import Link from 'next/link'
import type { LoyaltyProgress } from '@/types'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'

const STAMPS_PER_CARD = 8

function StampMarks({ filled }: { filled: number }) {
  return (
    <div className="flex justify-between" aria-hidden="true">
      {Array.from({ length: STAMPS_PER_CARD }, (_, index) => (
        <span
          key={index}
          className={[
            'h-5 w-5 rounded-full',
            index < filled
              ? 'border-2 border-foreground bg-foreground'
              : 'border-2 border-foreground/30 bg-transparent',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

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

  return (
    <div className="relative aspect-[1.6/1] w-full overflow-hidden rounded-2xl bg-sky p-5 shadow-card">
      <div className="flex items-start justify-between">
        <SoloCafeWordmark height={20} />
        <p className="text-body-sm font-semibold text-foreground">{loyalty.shop_name}</p>
      </div>
      <div className="mt-5">
        <StampMarks filled={filled} />
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <p className="text-h3 text-foreground">
          {filled} of {required} stamps
        </p>
        <p className="mt-1 text-body-sm text-foreground/80">
          {loyalty.can_redeem
            ? 'You can redeem it on your next order.'
            : remaining === 1
              ? '1 stamp to go.'
              : `${remaining} stamps to go.`}
        </p>
        {compact && loyalty.shop_slug && (
          <Link href={`/${loyalty.shop_slug}`} className="mt-2 inline-block text-sm font-semibold text-foreground hover:underline">
            Order at {loyalty.shop_name}
          </Link>
        )}
      </div>
    </div>
  )
}

export function EmptyStampCard() {
  return (
    <div className="relative aspect-[1.6/1] w-full overflow-hidden rounded-2xl bg-sky p-5 shadow-card" aria-labelledby="stamp-card-title">
      <div className="flex items-start justify-between">
        <SoloCafeWordmark height={20} />
        <h2 id="stamp-card-title" className="text-h3 text-foreground">Stamp card</h2>
      </div>
      <div className="absolute inset-x-5 top-1/2 -translate-y-1/2">
        <StampMarks filled={0} />
      </div>
      <p className="absolute bottom-5 left-5 right-5 max-w-[34ch] text-body-sm text-foreground/80">
        Sign up and every order earns a stamp.
      </p>
    </div>
  )
}
