import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'
import { Magnetic } from './magnetic'

export function FinalCTA() {
  return (
    <section className="landing-grain relative bg-foreground px-6 py-20 text-background sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="landing-font-display text-3xl font-normal tracking-tight text-background sm:text-4xl">
            Tomorrow, skip the queue.
          </h2>
          <p className="mt-4 text-lg text-background/70">
            Order now. Pick it up when it says Ready.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic className="w-full sm:w-auto">
              <Button asChild variant="cta" size="lg" className="w-full sm:w-auto">
                <Link href="/inicio">Order a coffee</Link>
              </Button>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-background/30 bg-background/10 text-background hover:bg-background/20 hover:text-background sm:w-auto"
              >
                <Link href="/demo">See demo</Link>
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
