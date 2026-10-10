import type { InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={[
        'block w-full h-11 rounded-lg border border-border bg-background px-4 text-sm text-foreground',
        'placeholder:text-muted-foreground',
        'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/10',
        'disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-foreground',
        className,
      ].join(' ')}
      {...props}
    />
  )
}
