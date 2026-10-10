import type { SVGProps } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Coffee,
  Copy,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  FolderOpen,
  MapPin,
  Maximize2,
  Package,
  Menu,
  MessageCircle,
  Minimize2,
  Minus,
  Plus,
  QrCode,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Store,
  Tag,
  Trash2,
  User,
  Utensils,
  Volume2,
  VolumeX,
  X,
  type LucideProps,
} from 'lucide-react'

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'cart'
  | 'check'
  | 'chevron-down'
  | 'chevron-right'
  | 'clock'
  | 'coffee'
  | 'copy'
  | 'credit-card'
  | 'edit'
  | 'eye'
  | 'eye-off'
  | 'external-link'
  | 'folder-open'
  | 'map-pin'
  | 'maximize-2'
  | 'menu'
  | 'message-circle'
  | 'minimize-2'
  | 'minus'
  | 'package'
  | 'plus'
  | 'qrcode'
  | 'receipt'
  | 'search'
  | 'settings'
  | 'sliders-horizontal'
  | 'star'
  | 'store'
  | 'tag'
  | 'trash'
  | 'user'
  | 'utensils'
  | 'volume-2'
  | 'volume-x'
  | 'x'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  className?: string
}

const iconMap: Record<IconName, React.ComponentType<LucideProps>> = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  cart: ShoppingCart,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  clock: Clock,
  coffee: Coffee,
  copy: Copy,
  'credit-card': CreditCard,
  edit: Edit,
  eye: Eye,
  'eye-off': EyeOff,
  'external-link': ExternalLink,
  'folder-open': FolderOpen,
  'map-pin': MapPin,
  'maximize-2': Maximize2,
  menu: Menu,
  'message-circle': MessageCircle,
  'minimize-2': Minimize2,
  minus: Minus,
  package: Package,
  plus: Plus,
  qrcode: QrCode,
  receipt: Receipt,
  search: Search,
  settings: Settings,
  'sliders-horizontal': SlidersHorizontal,
  star: Star,
  store: Store,
  tag: Tag,
  trash: Trash2,
  user: User,
  utensils: Utensils,
  'volume-2': Volume2,
  'volume-x': VolumeX,
  x: X,
}

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.75, ...props }: IconProps) {
  const Component = iconMap[name]
  if (!Component) return null
  return <Component className={className} strokeWidth={strokeWidth} {...props} />
}
