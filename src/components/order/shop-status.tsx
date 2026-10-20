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

  return (
    <section className="mx-auto max-w-3xl px-4 pt-4 sm:px-5">
      <div
        className={[
          'rounded-2xl border px-4 py-4',
          paused || closed ? 'border-warning/30 bg-warning/10' : 'border-border bg-surface',
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          <Icon name="clock" className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {paused ? 'Ahora no tomamos pedidos para recoger' : closed ? 'Cerrado ahora' : 'Abierto para recoger'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{today}</p>
            {closed && ordering?.accepting_pickup && (
              <p className="mt-1 text-sm text-foreground">Puedes programar tu recogida dentro del horario.</p>
            )}
          </div>
        </div>
        {hours && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DAY_LABELS.map(({ key, label }) => {
              const day = hours[key]
              return (
                <div key={key} className="rounded-xl bg-background/70 px-3 py-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-xs font-medium text-foreground">
                    {day?.is_open && day.open && day.close ? `${day.open} a ${day.close}` : 'Cerrado'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
