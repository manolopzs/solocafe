'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  position?: 'bottom' | 'center' | 'right'
  className?: string
  /** Full-bleed content: no padding, the handle floats over the top edge. */
  bare?: boolean
}

export function Sheet({ open, onClose, title, children, footer, position = 'bottom', className = '', bare = false }: SheetProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; currentY: number; dragging: boolean } | null>(null)

  useEffect(() => {
    // Orchestrate mount/unmount so the sheet can animate in and out.
    if (open) {
      const raf = requestAnimationFrame(() => {
        setMounted(true)
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(raf)
    } else {
      const raf = requestAnimationFrame(() => setVisible(false))
      const timer = setTimeout(() => setMounted(false), 200)
      return () => {
        cancelAnimationFrame(raf)
        clearTimeout(timer)
      }
    }
  }, [open])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  function handlePointerDown(e: PointerEvent) {
    if (position !== 'bottom') return
    dragRef.current = { startY: e.clientY, currentY: e.clientY, dragging: false }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragRef.current || position !== 'bottom') return
    const delta = e.clientY - dragRef.current.startY
    if (Math.abs(delta) > 4) dragRef.current.dragging = true
    dragRef.current.currentY = e.clientY
    if (sheetRef.current && delta > 0) {
      sheetRef.current.style.transform = `translateY(${delta}px)`
    }
  }

  function handlePointerUp(e: PointerEvent) {
    if (!dragRef.current || position !== 'bottom') return
    const delta = e.clientY - dragRef.current.startY
    if (sheetRef.current) sheetRef.current.style.transform = ''
    if (delta > 100) onClose()
    dragRef.current = null
  }

  const isBottom = position === 'bottom'
  const isRight = position === 'right'
  const isCenter = position === 'center'

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={[
          'absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
      <div
        ref={sheetRef}
        className={[
          'absolute bg-surface-elevated shadow-2xl transition-all duration-[320ms] ease-out-soft motion-reduce:transition-opacity motion-reduce:duration-150',
          isBottom
            ? 'bottom-0 left-0 right-0 top-auto flex max-h-[92vh] flex-col overflow-hidden rounded-t-sheet'
            : isRight
              ? 'right-0 top-0 bottom-0 h-full w-full max-w-md rounded-l-2xl'
              : 'left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl',
          isBottom && visible ? 'translate-y-0' : '',
          isBottom && !visible ? 'translate-y-full' : '',
          isRight && visible ? 'translate-x-0' : '',
          isRight && !visible ? 'translate-x-full' : '',
          isCenter && visible ? 'scale-100 opacity-100' : '',
          isCenter && !visible ? 'scale-95 opacity-0' : '',
          className,
        ].join(' ')}
      >
        {isBottom && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={[
              'flex cursor-grab justify-center pt-4 pb-2 active:cursor-grabbing',
              bare ? 'absolute left-1/2 top-0 z-10 w-24 -translate-x-1/2' : '',
            ].join(' ')}
          >
            <div className="h-[5px] w-9 rounded-full bg-subtle" />
          </div>
        )}
        {title && (
          <div className="flex items-center justify-between px-5 pb-1 pt-1">
            <h2 className="text-h2 text-heading">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="-mr-0.5 flex h-11 w-11 items-center justify-center rounded-full"
              aria-label="Cerrar"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pill text-foreground">
                <X className="h-5 w-5" />
              </span>
            </button>
          </div>
        )}
        <div className={[
          'overflow-y-auto',
          isBottom ? 'min-h-0 flex-1' : 'h-[calc(100%-4rem)]',
          bare ? '' : isBottom ? 'px-5 pb-6 pt-4' : 'p-6',
        ].join(' ')}>{children}</div>
        {footer && (
          <div className="shrink-0 bg-inherit px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
