import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'outline' | 'flat'
}

const variantStyles: Record<Required<CardProps>['variant'], string> = {
  default: 'bg-paper shadow-sm',
  outline: 'bg-paper border border-warm-200',
  flat: 'bg-warm-50',
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl',
        variantStyles[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={['p-5 pb-0', className].join(' ')}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={['text-base font-semibold text-foreground', className].join(' ')}>{children}</h3>
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={['text-sm text-muted-foreground', className].join(' ')}>{children}</p>
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={['p-5', className].join(' ')}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={['flex items-center gap-3 p-5 pt-0', className].join(' ')}>{children}</div>
}
