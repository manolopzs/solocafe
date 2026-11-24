import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Reveal } from './reveal'
import { Magnetic } from './magnetic'
import { WaitlistForm } from './waitlist-form'

export function FinalCTA() {
  return (
    <section id="app" className="landing-grain relative scroll-mt-24 bg-foreground px-6 py-20 text-background sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="landing-font-display text-3xl font-normal tracking-tight text-background sm:text-4xl">
            Tomorrow, skip the queue.
          </h2>
          <p className="mt-4 text-lg text-background/70">
            Get it first. Pick it up when it says Ready.
          </p>
          <p className="mt-10 text-sm font-semibold text-background/70">
            iOS app coming soon
          </p>
          <WaitlistForm />
          <Magnetic className="mt-6 flex w-full justify-center sm:inline-flex sm:w-auto">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-background/30 bg-background/10 text-background hover:bg-background/20 hover:text-background sm:w-auto"
            >
              <Link href="/demo">See demo</Link>
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}
