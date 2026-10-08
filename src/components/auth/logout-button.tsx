'use client'

import { logoutAction } from '@/server/actions/auth'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-zinc-600 hover:text-zinc-900"
      >
        Cerrar sesion
      </button>
    </form>
  )
}
