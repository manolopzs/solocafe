import Image from 'next/image'
import { formatMoney } from '@/lib/ordering'
import { SoloIconTile } from '@/components/brand/solo-cafe-logo'

export const orderItem = { name: 'Latte', cents: 200, qty: 1 }
export const pickupTime = 'Pickup 9:40'
export const code = '7E3D'

export function PhoneHeader({ title, subtle }: { title: string; subtle?: string }) {
  return (
    <div className="mb-3 lg:mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-xs">
        {subtle ?? 'Solo cafe'}
      </p>
      <p className="text-xs font-semibold text-foreground lg:text-sm">{title}</p>
    </div>
  )
}

export function SummaryItem({ item }: { item: typeof orderItem }) {
  return (
    <div className="flex items-center justify-between py-1.5 lg:py-2">
      <span className="text-[10px] text-muted-foreground lg:text-xs">
        {item.qty} x {item.name}
      </span>
      <span className="text-[10px] font-medium text-foreground lg:text-xs">
        {formatMoney(item.cents * item.qty)}
      </span>
    </div>
  )
}

export function OrderTotal({ cents = 200 }: { cents?: number }) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-2 lg:pt-3">
      <span className="text-[10px] font-medium text-muted-foreground lg:text-xs">Total</span>
      <span className="text-xs font-semibold text-foreground lg:text-sm">{formatMoney(cents)}</span>
    </div>
  )
}

export function ProgressIndicator({ active }: { active: 'received' | 'preparing' | 'ready' }) {
  const steps: { key: typeof active; label: string }[] = [
    { key: 'received', label: 'Received' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
  ]
  const activeIndex = steps.findIndex((s) => s.key === active)
  return (
    <div className="flex items-center justify-between gap-1">
      {steps.map((step, idx) => {
        const isActive = step.key === active
        const isPast = activeIndex > idx
        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold lg:h-6 lg:w-6 lg:text-[10px] ${
                  isActive || isPast
                    ? 'bg-foreground text-background'
                    : 'border border-border bg-background text-muted-foreground'
                }`}
              >
                {isPast ? (
                  <svg className="h-3 w-3 lg:h-3.5 lg:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[9px] font-medium lg:text-[10px] ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`mx-1 h-px flex-1 lg:mx-2 ${isPast ? 'bg-foreground' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

export function ReceivedScreen() {
  return (
    <div className="flex h-full flex-col bg-background p-3 pt-6 lg:p-4 lg:pt-7">
      <PhoneHeader title="Order sent" />
      <div className="mt-1 lg:mt-2">
        <ProgressIndicator active="received" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-card ring-4 ring-surface lg:h-32 lg:w-32">
          <Image src="/menu/latte.jpg" alt="" fill sizes="128px" className="object-cover" />
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground lg:mt-4 lg:text-base">The cafe has your order</p>
        <p className="mt-0.5 px-2 text-[10px] text-muted-foreground lg:text-xs">
          We will tell you when it is ready
        </p>
      </div>
      <div className="rounded-xl bg-surface p-3 lg:p-4">
        <SummaryItem item={orderItem} />
        <OrderTotal />
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground lg:mt-4 lg:text-xs">
        <ClockIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        {pickupTime}
      </div>
    </div>
  )
}

export function PreparingScreen({ animateBar = false }: { animateBar?: boolean }) {
  return (
    <div className="flex h-full flex-col bg-background p-3 pt-6 lg:p-4 lg:pt-7">
      <PhoneHeader title="Preparing" />
      <div className="mt-1 lg:mt-2">
        <ProgressIndicator active="preparing" />
      </div>
      <div className="mt-4 lg:mt-6">
        <p className="text-center text-sm font-semibold text-foreground lg:text-base">Preparing</p>
        <p className="text-center text-[10px] text-muted-foreground lg:text-xs">The cafe is making your order</p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border lg:mt-6">
          <div
            className={`h-full origin-left rounded-full bg-foreground ${animateBar ? 'landing-preparing-bar' : 'scale-x-100'}`}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden py-3 lg:py-4">
        <div className="rounded-xl bg-surface p-3 lg:p-4">
          <SummaryItem item={orderItem} />
          <OrderTotal />
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground lg:text-xs">
        <ClockIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        Ready in a few minutes
      </div>
    </div>
  )
}

export function ReadyScreen({ showNotification = false, animateCode = false }: { showNotification?: boolean; animateCode?: boolean }) {
  return (
    <div className="relative flex h-full flex-col bg-listo-bg p-3 pt-6 text-listo-code lg:p-4 lg:pt-7">
      <div className="mb-3 lg:mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-listo-muted lg:text-xs">
          Solo cafe
        </p>
        <div className="mt-2 inline-flex items-center rounded-full bg-listo-card px-2.5 py-1 lg:px-3">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success lg:h-2 lg:w-2" />
          <span className="text-[10px] font-semibold text-listo-code lg:text-xs">Ready</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="landing-ready-card relative rounded-2xl bg-listo-card p-5 lg:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-listo-muted lg:text-xs">
            Pickup code
          </p>
          <div className="mt-2 flex items-center justify-center gap-0.5 lg:gap-1">
            {code.split('').map((char, index) => (
              <div key={index} className="relative h-10 w-[1.6rem] overflow-hidden lg:h-14 lg:w-9">
                <span
                  className={`absolute inset-0 flex items-center justify-center text-4xl font-light tracking-tight text-listo-code landing-font-display lg:text-6xl ${
                    animateCode ? 'landing-code-tick' : ''
                  }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {char}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[10px] text-listo-muted lg:mt-4 lg:text-xs">Show it at the counter</p>
      </div>
      <div className="rounded-xl bg-listo-card p-3 lg:p-4">
        <SummaryItem item={orderItem} />
        <OrderTotal />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-listo-muted lg:mt-4 lg:text-xs">
        <ClockIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        {pickupTime}
      </div>
      <div
        className={`absolute inset-x-2.5 top-10 z-30 transition-[opacity,translate] duration-500 ease-out lg:inset-x-3 lg:top-12 ${
          showNotification ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        aria-hidden={!showNotification}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/80 p-3 shadow-lg backdrop-blur-md lg:p-4">
            <SoloIconTile size={40} className="h-10 w-10 shrink-0 rounded-xl lg:h-12 lg:w-12" />
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-foreground lg:text-xs">Solo cafe</p>
                <p className="text-[10px] text-muted-foreground lg:text-xs">now</p>
              </div>
              <p className="mt-0.5 text-xs font-medium text-foreground lg:text-sm">Your latte is ready</p>
            </div>
          </div>
        </div>
      </div>
  )
}

export function PickedUpScreen() {
  return (
    <div className="flex h-full flex-col bg-background p-3 pt-6 text-center lg:p-4 lg:pt-7">
      <div className="mb-3 text-left lg:mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:text-xs">
          Solo cafe
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 lg:h-14 lg:w-14">
          <svg className="h-6 w-6 text-success lg:h-7 lg:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground lg:mt-4 lg:text-base">Picked up</p>
        <p className="text-[10px] text-muted-foreground lg:text-xs">Enjoy your coffee</p>
      </div>
      <div className="rounded-xl bg-surface p-3 lg:p-4">
        <SummaryItem item={orderItem} />
        <OrderTotal />
      </div>
      <div className="mt-3 flex justify-center lg:mt-4">
        <span className="inline-flex items-center rounded-full bg-foreground px-4 py-2 text-[10px] font-semibold text-background lg:px-5 lg:py-2.5 lg:text-xs">
          Order again
        </span>
      </div>
    </div>
  )
}
