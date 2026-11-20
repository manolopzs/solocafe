import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Reveal } from './reveal'

const benefits = [
  'Orders arrive on the bar screen in real time',
  'Set your menu and how many orders per time slot you take',
  'Customers pay at the counter on pickup',
  'Free during the pilot',
]

export function ForCafes() {
  return (
    <section id="for-cafes" className="scroll-mt-24 bg-surface px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="order-2">
            <div className="relative mx-auto aspect-[4/5] max-h-[560px] w-full max-w-md overflow-hidden rounded-card lg:max-w-none">
              <Image
                src="/landing/barista.jpg"
                alt="Barista holding a takeaway cup"
                fill
                sizes="(max-width: 1024px) 448px, 50vw"
                className="object-cover object-top"
              />
            </div>
          </Reveal>
          <div className="order-1">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">For cafes</p>
              <h2 className="mt-3 landing-font-display text-3xl font-normal tracking-tight text-heading sm:text-4xl">
                Serve more orders without the chaos
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Solo Café gives your customers a simple way to order ahead and gives your bar a clear, real-time view of what to make.
              </p>
            </Reveal>
            <Reveal delay={1}>
              <ul className="mt-8 space-y-4">
                {benefits.map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                      <Icon name="check" className="h-3 w-3 text-foreground" />
                    </div>
                    <span className="text-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={2}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild variant="outline" size="lg" className="w-full whitespace-nowrap sm:w-auto">
                  <Link href="/demo">See demo</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full whitespace-nowrap sm:w-auto">
                  <Link href="/demo/kds">See the bar screen</Link>
                </Button>
                <Button asChild variant="espresso" size="lg" className="w-full whitespace-nowrap sm:w-auto">
                  <Link href="/auth/signup">Open my cafe for free</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
