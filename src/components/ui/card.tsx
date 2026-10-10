import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'outline' | 'flat'
}

const variantStyles: Record<Required<CardProps>['variant'], string> = {
  default: 'bg-surface-elevated border border-border',
  outline: 'bg-surface-elevated border border-border',
  flat: 'bg-surface',
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-lg',
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
  return <div className={['p-6 pb-0', className].join(' ')}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={['text-base font-semibold text-foreground', className].join(' ')}>{children}</h3>
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={['mt-1 text-sm text-muted-foreground', className].join(' ')}>{children}</p>
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={['p-6', className].join(' ')}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={['flex items-center gap-3 p-6 pt-0', className].join(' ')}>{children}</div>
}
