import { forwardRef, type TextareaHTMLAttributes } from 'react'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={[
          'block w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground',
          'placeholder:text-muted-foreground/70',
          'focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/10',
          'disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-foreground',
          'transition-all duration-150',
          className,
        ].join(' ')}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
