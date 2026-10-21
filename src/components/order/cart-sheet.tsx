'use client'

import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Notice } from '@/components/ui/notice'
import { QuantityStepper } from '@/components/order/quantity-stepper'
import { Sheet } from '@/components/ui/sheet'

export interface CartViewLine {
  key: string
  name: string
  detail: string
  quantity: number
  lineTotal: string
  unavailable: boolean
}

export function CartSheet({
  open,
  onClose,
  lines,
  total,
  blockedCopy,
  onQuantity,
  onRemove,
  onCheckout,
}: {
  open: boolean
  onClose: () => void
  lines: CartViewLine[]
  total: string
  blockedCopy: string | null
  onQuantity: (index: number, quantity: number) => void
  onRemove: (index: number) => void
  onCheckout: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Tu pedido" position="bottom" className="flex flex-col">
      <div className="flex h-full flex-col">
        {lines.length === 0 ? (
          <EmptyState
            icon={<Icon name="cart" className="h-6 w-6" />}
            title="Tu pedido está vacío"
            description="Agrega algo del menú para empezar."
          />
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border">
              {lines.map((line, index) => (
                <li key={line.key} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{line.name}</p>
                      {line.detail && <p className="mt-0.5 text-sm text-muted-foreground">{line.detail}</p>}
                      {line.unavailable && (
                        <span className="mt-2 inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
                          Ya no disponible
                        </span>
                      )}
                      <p className="mt-1 text-sm font-medium tabular-nums text-foreground">{line.lineTotal}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-surface hover:text-danger"
                      aria-label={`Eliminar ${line.name}`}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <QuantityStepper
                      value={line.quantity}
                      onDecrease={() => onQuantity(index, line.quantity - 1)}
                      onIncrease={() => onQuantity(index, line.quantity + 1)}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="sticky bottom-0 -mx-6 mt-4 border-t border-border bg-surface-elevated px-4 py-4 sm:px-6">
              {blockedCopy && (
                <div className="mb-3">
                  <Notice tone="danger">{blockedCopy}</Notice>
                </div>
              )}
              <div className="mb-3 flex items-baseline justify-between text-foreground">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-medium tabular-nums">{total}</span>
              </div>
              <Button onClick={onCheckout} disabled={Boolean(blockedCopy)} size="lg" className="w-full">
                Continuar al pago
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}
