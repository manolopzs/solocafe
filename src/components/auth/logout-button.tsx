'use client'

import { logoutAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm" className="h-11 px-3 text-body-sm">
        Log out
      </Button>
    </form>
  )
}
