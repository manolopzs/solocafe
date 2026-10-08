import { forwardRef, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
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
Input.displayName = 'Input'
