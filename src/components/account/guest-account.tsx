import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { SoloCafeWordmark } from '@/components/brand/solo-cafe-logo'

/** Why a guest would sign up. Each line must stay true of the product as it works today. */
export const ACCOUNT_REASONS: readonly { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'user',
    title: 'Your name and phone, saved',
    body: 'No need to type them on every order.',
  },
  {
    icon: 'repeat',
    title: 'Reorder in one tap',
    body: 'Your usual coffee, without browsing the menu.',
  },
]

/**
 * Account for guests (mock 08): an empty stamp card that explains stamps, two
 * reasons with icons, then Sign up (espresso, not an order step).
 * The card shows no count: each shop sets its own number of stamps.
 */
export function GuestAccount() {
  return (
    <main className="min-h-screen bg-background">
      <div className="pb-tabs mx-auto max-w-xl px-5">
        <div className="flex h-14 items-center">
          <SoloCafeWordmark height={20} />
        </div>
        <h1 className="mt-2 text-h1 text-heading">Your account</h1>
        <p className="mt-2 text-body text-muted-foreground">You can order without an account. With one, you order faster.</p>

        <section className="mt-6 rounded-card bg-sky p-5" aria-labelledby="stamp-card-title">
          <h2 id="stamp-card-title" className="text-h3 text-foreground">Stamp card</h2>
          <div className="mt-4 flex justify-between" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className="h-[22px] w-[22px] rounded-full border-[1.5px] border-dashed border-foreground/55" />
            ))}
          </div>
          <p className="mt-4 max-w-[34ch] text-body-sm text-foreground/80">Every paid order earns a stamp at that coffee shop.</p>
        </section>

        <ul className="mt-3 divide-y divide-border rounded-card border border-border bg-surface-elevated px-4 shadow-card">
          {ACCOUNT_REASONS.map((reason) => (
            <li key={reason.title} className="flex gap-3 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pill text-on-pill">
                <Icon name={reason.icon} className="h-[18px] w-[18px]" />
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
