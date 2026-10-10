import { forwardRef, type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={[
          'block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/10',
          'disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-foreground',
          'transition-shadow',
          className,
        ].join(' ')}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
