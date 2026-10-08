import type { LabelHTMLAttributes, ReactNode } from 'react'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={[
        'block text-sm font-medium text-warm-800',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </label>
  )
}
