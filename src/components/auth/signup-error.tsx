import Link from 'next/link'
import { Notice } from '@/components/ui/notice'
import type { SignupErrorState } from '@/lib/api/errors'

const linkClass = 'font-medium underline underline-offset-2'

export function SignupError({
  state,
  loginHref,
  recoverHref,
}: {
  state: SignupErrorState
  loginHref: string
  recoverHref: string
}) {
  return (
    <Notice tone="danger">
      <p>{state.error}</p>
      {state.code === 'email_taken' && (
        <p className="mt-1">
          <Link href={loginHref} className={linkClass}>
            Entrar
          </Link>
          <span aria-hidden="true"> · </span>
          <Link href={recoverHref} className={linkClass}>
            Recuperar contraseña
          </Link>
        </p>
      )}
    </Notice>
  )
}
