import { forwardRef, type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={[
          'block w-full rounded-xl border border-warm-200 bg-paper px-3.5 py-2.5 text-sm text-foreground',
          'placeholder:text-warm-400',
          'focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10',
          'disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-warm-500',
          'transition-shadow',
          className,
        ].join(' ')}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
