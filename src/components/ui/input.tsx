import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={[
        'block w-full rounded-xl border border-warm-200 bg-paper px-4 py-3 text-sm text-foreground',
        'placeholder:text-warm-400',
        'focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400/20',
        'disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-warm-400',
        className,
      ].join(' ')}
      {...props}
    />
  )
}
