import type { InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={[
        'block w-full h-12 rounded-xl border border-border bg-surface-elevated px-4 text-sm text-foreground',
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
