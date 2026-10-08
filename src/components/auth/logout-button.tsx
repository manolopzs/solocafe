'use client'

import { logoutAction } from '@/server/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm">
        Cerrar sesion
      </Button>
    </form>
  )
}
