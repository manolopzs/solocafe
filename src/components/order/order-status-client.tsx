'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getOrderWithItems } from '@/server/queries/orders'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import type { Order, OrderStatus, OrderItem, OrderItemModifier } from '@/types'

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pendiente de pago',
  received: 'Recibido',
  preparing: 'Preparando',
  ready: 'Listo',
  picked_up: 'Entregado',
  cancelled: 'Cancelado',
}

const statusSteps: OrderStatus[] = ['received', 'preparing', 'ready', 'picked_up']

function formatCurrency(cents: number, currency: string) {
  return `${currency} ${(cents / 100).toFixed(2)}`
}

function orderNumber(id: string) {
  return id.slice(-6).toUpperCase()
}

export function OrderStatusClient({
  initialOrder,
  phone,
}: {
  initialOrder: Order & { items: (OrderItem & { modifiers: OrderItemModifier[] })[] }
  phone?: string
}) {
  const [order, setOrder] = useState(initialOrder)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const previousStatusRef = useRef(order.status)

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    } else {
      setNotificationPermission('unsupported')
    }
  }, [])

  useEffect(() => {
    if (
      notificationPermission === 'granted' &&
      previousStatusRef.current !== 'ready' &&
      order.status === 'ready'
    ) {
      new Notification('Tu pedido está listo', {
        body: 'Pasa a la barra a recogerlo.',
      })
    }
    previousStatusRef.current = order.status
  }, [order.status, notificationPermission])

  useEffect(() => {
    if (order.status === 'picked_up' || order.status === 'cancelled') return

    const fetchOrder = async () => {
      const updated = await getOrderWithItems(order.id, phone)
      if (updated) setOrder(updated)
    }

    const interval = setInterval(fetchOrder, 5000)
    return () => clearInterval(interval)
  }, [order.id, order.status, phone])

  const requestNotification = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
  }

  const currentStepIndex = statusSteps.indexOf(order.status)

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="arrow-left" className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="text-center">
          <div className={[
            'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
            order.status === 'ready' || order.status === 'picked_up'
              ? 'bg-sage-100 text-sage-600'
              : order.status === 'cancelled'
                ? 'bg-danger/10 text-danger'
                : 'bg-amber-100 text-amber-600',
          ].join(' ')}>
            <Icon name={order.status === 'ready' || order.status === 'picked_up' ? 'check' : 'clock'} className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground">
            {order.status === 'pending_payment'
              ? 'Pago pendiente'
              : order.status === 'ready'
                ? 'Tu pedido está listo'
                : order.status === 'picked_up'
                  ? 'Pedido entregado'
                  : order.status === 'cancelled'
                    ? 'Pedido cancelado'
                    : 'Preparando tu pedido'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {order.status === 'pending_payment'
              ? 'Completa el pago para que la cocina reciba tu pedido.'
              : order.status === 'ready'
                ? 'Pasa a recogerlo a la barra.'
                : order.status === 'picked_up'
                  ? 'Gracias por tu compra.'
                  : order.status === 'cancelled'
                    ? 'Tu pedido fue cancelado.'
                    : 'Te avisaremos en esta página cuando esté listo.'}
          </p>
        </div>

        {order.status !== 'cancelled' && (
          <Card variant="outline" className="mt-8 overflow-hidden">
            <CardContent className="p-5">
              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const done = idx <= currentStepIndex
                  const active = idx === currentStepIndex
                  return (
                    <div key={step} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                      <div
                        className={[
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                          done
                            ? 'bg-foreground text-primary-foreground'
                            : 'bg-surface text-muted-foreground border border-border',
                          active ? 'ring-2 ring-accent ring-offset-2' : '',
                        ].join(' ')}
                      >
                        {done ? <Icon name="check" className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className={['text-center text-[0.65rem] font-medium sm:text-xs', done ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
                        {statusLabels[step]}
                      </span>
                    </div>
                  )
                })}
                <div className="absolute left-0 right-0 top-4 -z-0 h-0.5 bg-border">
                  <div
                    className="h-full bg-foreground transition-all"
                    style={{ width: `${(Math.max(0, currentStepIndex) / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {notificationPermission === 'default' && (
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={requestNotification}>
            <Icon name="bell" className="mr-2 h-4 w-4" />
            Avísame cuando esté listo
          </Button>
        )}

        <Card variant="outline" className="mt-6 overflow-hidden">
          <div className="border-b border-border bg-surface px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Detalle del pedido</p>
          </div>
          <CardContent className="p-5">
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {item.quantity}x {item.item_name_snapshot}
                    </p>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.modifiers.map((m) => m.option_name_snapshot).join(', ')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{formatCurrency(order.total_cents, order.currency)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Orden</span>
              <span className="font-medium text-foreground">#{orderNumber(order.id)}</span>
            </div>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="mt-6 w-full">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  )
}
