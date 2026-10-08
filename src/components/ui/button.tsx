import { Children, cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  asChild?: boolean
  children: ReactNode
}

const variantStyles: Record<Required<ButtonProps>['variant'], string> = {
  primary:
    'bg-espresso-700 text-white shadow-sm hover:bg-espresso-800 active:bg-espresso-900 disabled:bg-warm-300 disabled:text-warm-500',
  secondary:
    'bg-warm-100 text-warm-900 hover:bg-warm-200 active:bg-warm-300 disabled:bg-warm-50 disabled:text-warm-400',
  outline:
    'border border-warm-200 bg-paper text-warm-900 hover:bg-warm-50 active:bg-warm-100 disabled:bg-warm-50 disabled:text-warm-400',
  ghost:
    'bg-transparent text-warm-700 hover:bg-warm-100 active:bg-warm-200 disabled:text-warm-400',
  danger:
    'bg-danger text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 disabled:text-white/70',
}

const sizeStyles: Record<Required<ButtonProps>['size'], string> = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-5 text-base rounded-xl gap-2',
  xl: 'h-14 px-6 text-base rounded-2xl gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  asChild = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center font-medium transition-colors',
    'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed',
    variantStyles[variant],
    sizeStyles[size],
    className,
  ].join(' ')

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: [classes, (children.props as { className?: string }).className].filter(Boolean).join(' '),
      ...props,
    })
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
