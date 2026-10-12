import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger'
  size?: 'sm' | 'default' | 'md' | 'lg' | 'xl' | 'icon'
  asChild?: boolean
  children: ReactNode
}

const variantStyles: Record<Required<ButtonProps>['variant'], string> = {
  primary:
    'bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-lg active:scale-[0.97] disabled:bg-subtle disabled:text-muted-foreground disabled:shadow-none',
  secondary:
    'bg-surface text-foreground border border-border hover:bg-background hover:shadow-sm active:scale-[0.97] disabled:bg-surface disabled:text-muted-foreground',
  outline:
    'border border-border bg-surface-elevated text-foreground hover:bg-surface hover:shadow-sm active:scale-[0.97] disabled:bg-surface disabled:text-muted-foreground',
  ghost:
    'bg-transparent text-foreground hover:bg-surface active:scale-[0.97] disabled:text-muted-foreground',
  destructive:
    'bg-danger text-danger-foreground shadow-md hover:bg-red-700 active:scale-[0.97] disabled:bg-red-200 disabled:text-white/70',
  danger:
    'bg-danger text-danger-foreground shadow-md hover:bg-red-700 active:scale-[0.97] disabled:bg-red-200 disabled:text-white/70',
}

const sizeStyles: Record<Required<ButtonProps>['size'], string> = {
  sm: 'h-9 px-4 text-sm rounded-full gap-1.5',
  default: 'h-12 px-6 text-sm rounded-full gap-2',
  md: 'h-12 px-6 text-sm rounded-full gap-2',
  lg: 'h-14 px-8 text-base rounded-full gap-2',
  xl: 'h-14 px-8 text-base rounded-full gap-2',
  icon: 'h-11 w-11 rounded-full',
}

export function Button({
  variant = 'primary',
  size = 'default',
  asChild = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center font-medium transition-all duration-150',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
