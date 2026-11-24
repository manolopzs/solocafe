import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PhosphorIcon, type PhosphorIconName } from '@/components/icons/phosphor'
import { EmptyStampCard } from '@/components/order/stamp-card'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'

/** Why a guest would sign up. Each line must stay true of the product as it works today. */
export const ACCOUNT_REASONS: readonly { icon: PhosphorIconName; title: string; body: string }[] = [
  {
    icon: 'user',
    title: 'Your name and phone, saved',
    body: 'No need to type them on every order.',
  },
  {
    icon: 'arrow-clockwise',
    title: 'Reorder in one tap',
    body: 'Your usual coffee, without browsing the menu.',
  },
]

/**
 * Account for guests: a physical stamp card, two reasons with icons,
 * then Sign up (espresso, not an order step).
 */
export function GuestAccount() {
  return (
    <main className="min-h-screen bg-background">
      <div className="pb-tabs phone-col px-5">
        <div className="flex h-14 items-center">
          <SoloCafeWordmark height={20} />
        </div>
        <h1 className="mt-2 text-h1 text-heading">Your account</h1>
        <p className="mt-2 text-body text-muted-foreground">You can order without an account. With one, you order faster.</p>

        <section className="mt-6">
          <EmptyStampCard />
        </section>

        <ul className="mt-3 divide-y divide-border rounded-card border border-border bg-surface-elevated px-4 shadow-card">
          {ACCOUNT_REASONS.map((reason) => (
            <li key={reason.title} className="flex gap-3 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pill text-on-pill">
                <PhosphorIcon name={reason.icon} className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-5 text-foreground">{reason.title}</p>
                <p className="mt-0.5 text-body-sm text-muted-foreground">{reason.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-center gap-1">
          <Button asChild variant="espresso" className="h-[52px] w-full text-base">
            <Link href="/account/signup">Sign up</Link>
          </Button>
          <p className="inline-flex min-h-11 items-center gap-1 px-3 text-body text-foreground">
            I already have an account ·
            <Link
              href="/account/login"
              className="rounded-sm font-semibold text-accent underline underline-offset-2 hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
