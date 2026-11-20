import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PhoneMock } from './phone-mock'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="landing-font-display text-[2.6rem] font-light text-background leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Order your coffee ahead. Skip the queue.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-background/75 sm:text-xl">
              Choose on your phone, the cafe makes it, and you pick it up when it says Ready. You pay at the counter.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
                <Link href="/inicio">Order a coffee</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-transparent sm:w-auto"
              >
                <Link href="#for-cafes">I have a cafe</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PhoneMock mode="auto" />
          </div>
        </div>
      </div>
    </section>
  )
}
