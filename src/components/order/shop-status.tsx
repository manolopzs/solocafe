'use client'

import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { todayHoursLabel } from '@/lib/ordering'
import type { OperatingHours, ShopOrdering } from '@/types'

const DAY_LABELS: { key: keyof OperatingHours; label: string }[] = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
]

export function ShopStatusBadge({ ordering }: { ordering?: ShopOrdering }) {
  if (ordering?.status === 'not_accepting') {
    return <Badge variant="warning">Sin pedidos</Badge>
  }
  if (ordering?.status === 'closed') {
    return <Badge variant="secondary">Cerrado</Badge>
  }
  return (
    <Badge variant="success" className="gap-1.5 pl-2">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      Abierto
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
              {day?.is_open && day.open && day.close ? `${day.open} a ${day.close}` : 'Cerrado'}
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

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-5">
      <div className={quiet ? '' : 'rounded-3xl bg-warning/10 px-4 py-4'}>
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
              <Icon name="clock" className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {paused ? 'Ahora no tomamos pedidos para recoger' : closed ? 'Cerrado ahora' : today}
              </span>
            </span>
            {hours && <span className="shrink-0 text-sm font-medium text-accent">Horario</span>}
          </summary>
          {!quiet && <p className="mt-1 pl-6 text-sm text-muted-foreground">{today}</p>}
          {closed && ordering?.accepting_pickup && (
            <p className="mt-1 pl-6 text-sm text-foreground">Puedes programar tu recogida dentro del horario.</p>
          )}
          {hours && <WeekHours hours={hours} />}
        </details>
      </div>
    </section>
  )
}
