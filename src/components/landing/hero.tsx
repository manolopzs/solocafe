import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeviceFrame } from './device-frame'
import { Magnetic } from './magnetic'

export function Hero() {
  return (
    <section className="landing-grain relative overflow-hidden bg-foreground text-background">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-20 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--surface-elevated)_0%,transparent_65%)] opacity-20 lg:right-[10%]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-32 sm:pt-32 sm:pb-40 lg:pt-40 lg:pb-48">
        <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <h1 className="landing-font-display text-[2.9rem] font-light leading-[1.05] tracking-tight text-background sm:text-[4rem] lg:text-[5.25rem]">
              Order ahead. Skip the{' '}
              <span className="landing-font-accent italic">queue</span>.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-background/75 sm:text-xl">
              Pick your coffee on your phone. The cafe makes it. Walk in, show your code, pay at the counter.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
                  className="w-full border-transparent bg-background/10 text-background hover:bg-background/20 hover:text-background sm:w-auto"
                >
                  <Link href="#for-cafes">I have a cafe</Link>
                </Button>
              </Magnetic>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <SteamWisps />
            <DeviceFrame />
          </div>
        </div>
      </div>
    </section>
  )
}

function SteamWisps() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible" aria-hidden="true">
      <div className="landing-steam landing-steam-1 absolute left-[20%] top-[10%] h-24 w-1 rounded-full bg-gradient-to-t from-white/10 to-transparent opacity-0" />
      <div className="landing-steam landing-steam-2 absolute left-[45%] top-[5%] h-32 w-1 rounded-full bg-gradient-to-t from-white/10 to-transparent opacity-0" />
      <div className="landing-steam landing-steam-3 absolute left-[70%] top-[12%] h-20 w-1 rounded-full bg-gradient-to-t from-white/10 to-transparent opacity-0" />
    </div>
  )
}
