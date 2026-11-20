import Link from 'next/link'
import { Icon } from '@/components/ui/icon'

/** Signed-in header action on Inicio: the name's initial in a 36px sky disc, 44px tap zone. */
export function AccountAvatar({ name }: { name: string | null | undefined }) {
  const initial = name?.trim().charAt(0).toLocaleUpperCase('en-GB') || null
  return (
    <Link
      href="/account"
      aria-label="Your account"
      className="-mr-1 flex h-11 w-11 items-center justify-center rounded-full"
      data-testid="account-avatar"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky text-body-sm font-semibold text-foreground">
        {initial ?? <Icon name="user" className="h-4 w-4" />}
      </span>
    </Link>
  )
}
