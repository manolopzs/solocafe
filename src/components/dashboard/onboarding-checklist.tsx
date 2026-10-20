'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { goLive } from '@/server/actions/shops'
import type { ShopOnboarding } from '@/types'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const stepCopy: Record<string, { title: string; pending: string; done: string }> = {
  menu: {
    title: 'Arma tu menú',
    pending: 'Hace falta al menos un producto activo. Al crear la cafetería dejamos un menú de ejemplo.',
    done: 'Tu menú ya tiene productos.',
  },
  stripe: {
    title: 'Conecta Stripe',
    pending: 'Sin una cuenta activa tus clientes no pueden pagar.',
    done: 'Ya puedes recibir pagos con tarjeta.',
  },
  hours: {
    title: 'Confirma el horario',
    pending: 'Revisa los días que abres y guarda los cambios.',
    done: 'El horario de recolección quedó guardado.',
  },
  live: {
    title: 'Publica la cafetería',
    pending: 'La página pública sigue oculta hasta que publiques.',
    done: 'Tu cafetería ya puede recibir pedidos.',
  },
}

function stepHref(key: string, shopId: string) {
  if (key === 'menu') return `/dashboard/${shopId}/menu`
  if (key === 'stripe' || key === 'hours') return `/dashboard/${shopId}/settings`
  return `/dashboard/${shopId}`
}

export function OnboardingChecklist({ shopId, onboarding }: { shopId: string; onboarding: ShopOnboarding }) {
  const [state, action, pending] = useActionState(async () => goLive(shopId), null)
  const doneCount = onboarding.steps.filter((step) => step.done).length

  return (
    <section className="rounded-2xl border border-terracotta-200 bg-cream p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">Antes de abrir</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {doneCount} de {onboarding.steps.length} listos. La página pública aparece cuando publiques.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {onboarding.steps.map((step, index) => {
          const copy = stepCopy[step.key] ?? { title: step.key, pending: '', done: '' }
          const isPublish = step.key === 'live'
          return (
            <li
              key={step.key}
              className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
                step.done ? 'border-terracotta-200 bg-terracotta-50' : 'border-warm-200 bg-white'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  step.done ? 'bg-terracotta-500 text-white' : 'border border-terracotta-300 bg-cream text-terracotta-700'
                }`}
              >
                {step.done ? <Icon name="check" className="h-4 w-4" /> : index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{copy.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{step.done ? copy.done : copy.pending}</p>
              </div>
              {isPublish ? (
                <form action={action}>
                  <Button type="submit" disabled={!onboarding.can_go_live || pending} loading={pending} size="sm">
                    Publicar
                  </Button>
                </form>
              ) : (
                <Button asChild variant={step.done ? 'outline' : 'primary'} size="sm">
                  <Link href={stepHref(step.key, shopId)}>{step.done ? 'Revisar' : 'Hacer'}</Link>
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      {state?.error === 'not_ready' && (
        <p className="mt-4 text-sm text-terracotta-700">Aún faltan pasos antes de publicar.</p>
      )}
      {state?.error === 'failed' && (
        <p className="mt-4 text-sm text-danger">No se pudo publicar. Intenta de nuevo.</p>
      )}
    </section>
  )
}
