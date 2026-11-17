import type { InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={[
        'block w-full h-[52px] rounded-field border border-input-border bg-surface-elevated px-4 text-base text-foreground',
        'placeholder:text-input-border',
        'focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/10',
        'disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-foreground',
        'transition-all duration-150',
        className,
      ].join(' ')}
      {...props}
    />
  )
}
