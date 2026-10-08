import type { SVGProps } from 'react'

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'cart'
  | 'check'
  | 'chevron-right'
  | 'clock'
  | 'coffee'
  | 'copy'
  | 'credit-card'
  | 'external-link'
  | 'map-pin'
  | 'menu'
  | 'minus'
  | 'plus'
  | 'qrcode'
  | 'receipt'
  | 'search'
  | 'settings'
  | 'store'
  | 'trash'
  | 'user'
  | 'utensils'
  | 'x'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  className?: string
}

export function Icon({ name, className = 'h-5 w-5', ...props }: IconProps) {
  const svgProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }

  switch (name) {
    case 'arrow-left':
      return (
        <svg {...svgProps}>
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      )
    case 'arrow-right':
      return (
        <svg {...svgProps}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      )
    case 'cart':
      return (
        <svg {...svgProps}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )
    case 'check':
      return (
        <svg {...svgProps}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg {...svgProps}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'coffee':
      return (
        <svg {...svgProps}>
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" x2="6.01" y1="2" y2="2" />
          <line x1="10" x2="10.01" y1="2" y2="2" />
          <line x1="14" x2="14.01" y1="2" y2="2" />
        </svg>
      )
    case 'copy':
      return (
        <svg {...svgProps}>
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )
    case 'credit-card':
      return (
        <svg {...svgProps}>
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    case 'external-link':
      return (
        <svg {...svgProps}>
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      )
    case 'map-pin':
      return (
        <svg {...svgProps}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...svgProps}>
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      )
    case 'minus':
      return (
        <svg {...svgProps}>
          <path d="M5 12h14" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...svgProps}>
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      )
    case 'qrcode':
      return (
        <svg {...svgProps}>
          <rect width="5" height="5" x="3" y="3" rx="1" />
          <rect width="5" height="5" x="16" y="3" rx="1" />
          <rect width="5" height="5" x="3" y="16" rx="1" />
          <path d="M21 16h-3v-3h-2v8h2v-3h3v-5z" />
          <path d="M8 10h8v8" />
        </svg>
      )
    case 'receipt':
      return (
        <svg {...svgProps}>
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
          <path d="M16 8H8" />
          <path d="M16 12H8" />
          <path d="M13 16H8" />
        </svg>
      )
    case 'search':
      return (
        <svg {...svgProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...svgProps}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'store':
      return (
        <svg {...svgProps}>
          <path d="M2 7.5a2.5 2.5 0 0 1 2.5-2.5h15A2.5 2.5 0 0 1 22 7.5c0 1.25-.5 2-1.5 2.5a4 4 0 0 1-4.5 0 4 4 0 0 1-4.5 0 4 4 0 0 1-4.5 0c-1-.5-1.5-1.25-1.5-2.5Z" />
          <path d="M4 10v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        </svg>
      )
    case 'trash':
      return (
        <svg {...svgProps}>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      )
    case 'user':
      return (
        <svg {...svgProps}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'utensils':
      return (
        <svg {...svgProps}>
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 2v20" />
          <path d="M15 2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2" />
        </svg>
      )
    case 'x':
      return (
        <svg {...svgProps}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      )
    default:
      return null
  }
}
