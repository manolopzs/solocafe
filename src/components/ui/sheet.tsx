'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  position?: 'bottom' | 'center' | 'right'
  className?: string
}

export function Sheet({ open, onClose, title, children, position = 'bottom', className = '' }: SheetProps) {
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
          'absolute bg-surface-elevated shadow-lg transition-all duration-200 ease-out',
          isBottom
            ? 'bottom-0 left-0 right-0 top-auto max-h-[90vh] rounded-t-lg'
            : isRight
              ? 'right-0 top-0 bottom-0 h-full w-full max-w-md rounded-l-lg'
              : 'left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg',
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
            className="flex cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing"
          >
            <div className="h-1.5 w-12 rounded-full bg-subtle" />
          </div>
        )}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="text-lg font-semibold text-foreground">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={[
          'overflow-y-auto',
          isBottom ? 'max-h-[calc(90vh-4rem)]' : 'h-[calc(100%-4rem)]',
          'p-6',
        ].join(' ')}>{children}</div>
      </div>
    </div>
  )
}
