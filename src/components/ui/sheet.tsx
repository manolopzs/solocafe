import type { ReactNode } from 'react'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  position?: 'bottom' | 'center'
  className?: string
}

export function Sheet({ open, onClose, title, children, position = 'bottom', className = '' }: SheetProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm transition-opacity" />
      <div
        className={[
          'absolute bg-paper shadow-xl',
          position === 'bottom'
            ? 'bottom-0 left-0 right-0 top-auto max-h-[85vh] rounded-t-3xl'
            : 'left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl',
          className,
        ].join(' ')}
      >
        {position === 'bottom' && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-10 rounded-full bg-warm-200" />
          </div>
        )}
        {(title || position === 'center') && (
          <div className="flex items-center justify-between border-b border-warm-100 px-5 py-4">
            <div className="text-lg font-semibold text-foreground">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-warm-500 hover:bg-warm-100 hover:text-warm-700"
              aria-label="Cerrar"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

function Icon({ name, className }: { name: string; className?: string }) {
  if (name === 'x') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    )
  }
  return null
}
