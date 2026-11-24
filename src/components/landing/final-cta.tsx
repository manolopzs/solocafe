import Link from 'next/link'
import { Reveal } from './reveal'
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
          <p className="mt-10 inline-flex rounded-full bg-background/10 px-3 py-1 text-xs font-semibold text-background/70">
            iOS app coming soon
          </p>
          <WaitlistForm />
          <Link
            href="/demo"
            className="mt-6 inline-flex min-h-11 items-center text-background/70 underline-offset-4 hover:text-background hover:underline"
          >
            Or try the demo →
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
