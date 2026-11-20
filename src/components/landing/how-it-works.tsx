import Image from 'next/image'
import { Reveal } from './reveal'

const steps = [
  {
    title: 'Order on your phone',
    description: 'Pick your drink, choose a pickup time, and send the order to the cafe.',
  },
  {
    title: 'We tell you when it is ready',
    description: 'The cafe receives the order on its bar screen and updates the status as it prepares it.',
  },
  {
    title: 'Pick it up at the counter, skip the queue',
    description: 'When the screen says Ready, show your pickup code at the counter and pay there.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-background px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">How it works</p>
          <h2 className="mt-3 landing-font-display text-3xl font-normal tracking-tight text-heading sm:text-4xl">
            Three steps to your coffee
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={(index + 1) as 1 | 2 | 3}>
                <div className="flex items-start gap-4">
                  <span className="landing-font-display w-12 shrink-0 text-3xl font-light leading-none tabular-nums text-muted-foreground/60">
                    0{index + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={2}>
            <div className="overflow-hidden rounded-card">
              <Image
                src="/landing/entrega.jpg"
                alt="Barista handing a takeaway cup to a customer"
                width={800}
                height={534}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full object-cover"
                priority={false}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
