'use client'

import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
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
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Icon name="cart" className="h-8 w-8" />
            </div>
            <p className="mt-4 font-medium text-foreground">Tu pedido está vacío</p>
            <p className="mt-1 text-sm">Agrega algo del menú para empezar.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {lines.map((line, index) => (
                <div key={line.key} className="rounded-xl border border-border bg-surface p-3">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{line.name}</p>
                      {line.detail && <p className="text-sm text-muted-foreground">{line.detail}</p>}
                      {line.unavailable && (
                        <span className="mt-2 inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
                          Ya no disponible
                        </span>
                      )}
                      <p className="mt-1 text-sm font-bold text-foreground">{line.lineTotal}</p>
                    </div>
                    <button
                      onClick={() => onRemove(index)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-danger touch-manipulation"
                      aria-label="Eliminar"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => onQuantity(index, line.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface touch-manipulation"
                      aria-label="Disminuir"
                    >
                      <Icon name="minus" className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{line.quantity}</span>
                    <button
                      onClick={() => onQuantity(index, line.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-surface touch-manipulation"
                      aria-label="Aumentar"
                    >
                      <Icon name="plus" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 border-t border-border bg-surface-elevated p-4 sm:p-6">
              {blockedCopy && <p className="mb-3 text-sm text-danger">{blockedCopy}</p>}
              <div className="mb-3 flex items-center justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span>{total}</span>
              </div>
              <Button onClick={onCheckout} disabled={Boolean(blockedCopy)} size="lg" className="w-full touch-manipulation">
                Continuar
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}
