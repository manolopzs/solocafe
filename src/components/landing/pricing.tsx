import { Card } from '@/components/ui/card'
import { env } from '@/lib/env'
import { formatMoney } from '@/lib/ordering'

type PricingTier = {
  name: string
  monthly_price_cents: number
  included_orders: number
  overage_per_order_cents: number
}

type PublicPricing = {
  platform_fee_percent: number
  tiers: PricingTier[]
}

async function loadPublicPricing(): Promise<PublicPricing | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/public/pricing`, {
      next: { revalidate: 60 },
    })
    if (!response.ok) return null

    const data = (await response.json()) as Partial<PublicPricing>
    if (!Array.isArray(data.tiers)) return null

    return {
      platform_fee_percent:
        typeof data.platform_fee_percent === 'number' ? data.platform_fee_percent : Number.NaN,
      tiers: data.tiers.filter(isPricingTier),
    }
  } catch {
    return null
  }
}

function isPricingTier(value: unknown): value is PricingTier {
  if (!value || typeof value !== 'object') return false
  const tier = value as Partial<PricingTier>
  return (
    typeof tier.name === 'string' &&
    typeof tier.monthly_price_cents === 'number' &&
    typeof tier.included_orders === 'number' &&
    typeof tier.overage_per_order_cents === 'number'
  )
}

function hasCommercialPrice(pricing: PublicPricing | null): pricing is PublicPricing {
  if (!pricing || pricing.tiers.length === 0) return false
  if (Number.isFinite(pricing.platform_fee_percent) && pricing.platform_fee_percent > 0) return true
  return pricing.tiers.some(
    (tier) => tier.monthly_price_cents > 0 || tier.overage_per_order_cents > 0
  )
}

export async function Pricing() {
  const pricing = await loadPublicPricing()

  return (
    <section id="pricing" className="landing-grain relative scroll-mt-24 bg-foreground px-6 py-20 text-background sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="landing-font-display text-3xl font-normal tracking-tight text-background sm:text-4xl">Pricing</h2>
          <p className="mt-4 text-background/70">
            Prices in euros for your cafe. During the pilot there is no monthly fee and no commission.
          </p>
        </div>
        <PricingSection pricing={pricing} />
      </div>
    </section>
  )
}

function PricingSection({ pricing }: { pricing: PublicPricing | null }) {
  if (!hasCommercialPrice(pricing)) {
    return (
      <Card className="mx-auto mt-14 max-w-xl p-8 text-center">
        <h3 className="text-3xl font-semibold text-foreground">Free during the pilot</h3>
        <p className="mt-4 text-sm text-muted-foreground">
          The pilot on the IE campus is free. When we set a price, you will see it here in euros before it applies.
        </p>
      </Card>
    )
  }

  return (
    <>
      <div
        className={`mt-14 grid gap-6 ${pricing.tiers.length > 1 ? 'sm:grid-cols-2' : 'mx-auto max-w-md'}`}
      >
        {pricing.tiers.map((tier) => (
          <Card key={tier.name} className="p-6">
            <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
            <p className="mt-4 text-3xl font-bold text-foreground">
              {formatMoney(tier.monthly_price_cents)}
              <span className="text-base font-medium text-muted-foreground"> per month</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              <li>{tier.included_orders} orders included</li>
              <li>{formatMoney(tier.overage_per_order_cents)} per extra order</li>
            </ul>
          </Card>
        ))}
      </div>
      {Number.isFinite(pricing.platform_fee_percent) && pricing.platform_fee_percent > 0 && (
        <p className="mt-6 text-center text-sm text-background/70">
          Platform fee: {String(pricing.platform_fee_percent)}% per order, in euros.
        </p>
      )}
    </>
  )
}
