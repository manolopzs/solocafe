import { forwardRef, type SelectHTMLAttributes } from 'react'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={[
          'block w-full appearance-none rounded-xl border border-input-border bg-surface-elevated px-3.5 py-2.5 text-sm text-foreground',
          'focus:border-ring focus:ring-4 focus:ring-ring/10',
          'disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-warm-500',
          'transition-shadow',
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'
