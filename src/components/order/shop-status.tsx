'use client'

import { Badge } from '@/components/ui/badge'
import { PhosphorIcon } from '@/components/icons/phosphor'
import { hoursConfigured, todayHoursLabel } from '@/lib/ordering'
import type { OperatingHours, ShopOrdering } from '@/types'

const DAY_LABELS: { key: keyof OperatingHours; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

export function ShopStatusBadge({ ordering }: { ordering?: ShopOrdering }) {
  if (ordering?.status === 'not_accepting') {
    return <Badge variant="warning">Not taking orders</Badge>
  }
  if (!hoursConfigured(ordering)) return null
  if (ordering?.status === 'closed') {
    return <Badge variant="secondary">Closed</Badge>
  }
  return (
    <Badge variant="success" className="gap-1.5 pl-2">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      Open
    </Badge>
  )
}

function WeekHours({ hours }: { hours: OperatingHours }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {DAY_LABELS.map(({ key, label }) => {
        const day = hours[key]
        return (
          <div key={key} className="rounded-2xl bg-background px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-sm text-foreground">
              {day?.is_open && day.open && day.close ? `${day.open} to ${day.close}` : 'Closed'}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export function ShopStatusBanner({
  ordering,
  hours,
}: {
  ordering?: ShopOrdering
  hours?: OperatingHours
}) {
  const today = todayHoursLabel(ordering)
  const paused = ordering?.status === 'not_accepting'
  const closed = ordering?.status === 'closed'
  const quiet = !paused && !closed

  if (!hoursConfigured(ordering)) {
    // No hours saved yet: don't present the default hours as real. Only say
    // something when ordering is actually blocked right now.
    if (quiet) return null
    return (
      <section className="phone-col px-5">
        <div className="rounded-3xl bg-warning/10 px-4 py-4">
          <p className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <PhosphorIcon name="clock" className="h-4 w-4 shrink-0 text-muted-foreground" />
            {paused ? "We're not taking pickup orders right now" : "We're not preparing on-demand orders right now"}
          </p>
          {closed && ordering?.accepting_pickup && (
            <p className="mt-1 pl-6 text-sm text-foreground">You can schedule your pickup.</p>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="phone-col px-5">
      <div className={quiet ? '' : 'rounded-3xl bg-warning/10 px-4 py-4'}>
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
              <PhosphorIcon name="clock" className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {paused ? "We're not taking pickup orders right now" : closed ? 'Closed now' : today}
              </span>
            </span>
            {hours && <span className="shrink-0 text-sm font-medium text-accent underline underline-offset-2">Hours</span>}
          </summary>
          {!quiet && <p className="mt-1 pl-6 text-sm text-muted-foreground">{today}</p>}
          {closed && ordering?.accepting_pickup && (
            <p className="mt-1 pl-6 text-sm text-foreground">You can schedule your pickup within opening hours.</p>
          )}
          {hours && <WeekHours hours={hours} />}
        </details>
      </div>
    </section>
  )
}
