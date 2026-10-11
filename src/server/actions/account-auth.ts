'use server'

import { redirect } from 'next/navigation'
import { apiPost, apiPatch } from '@/lib/api/server'
import { setToken, removeToken } from '@/lib/auth'

export async function accountLoginAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Correo y contraseña son requeridos' }
  }

  let token: string | undefined
  try {
    const data = await apiPost<{ token: string; user: { id: string; email: string; customer: { id: string; name: string | null; phone: string | null } | null } }>(
      '/auth/login',
      { email, password },
      false
    )
    token = data.token
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
    return { error: message }
  }

  if (token) {
    await setToken(token)
  }
  redirect('/account')
}

export async function accountSignupAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password) {
    return { error: 'Correo y contraseña son requeridos' }
  }

  let token: string | undefined
  try {
    const data = await apiPost<{ token: string; user: { id: string; email: string; customer: { id: string; name: string | null; phone: string | null } | null } }>(
      '/auth/signup',
      { user: { email, password } },
      false
    )
    token = data.token
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la cuenta'
    return { error: message }
  }

  if (token) {
    await setToken(token)
  }

  if (name) {
    try {
      await apiPatch('/customers/me', { customer: { name } })
    } catch {
      // ignore update error, user can fill profile later
    }
  }

  redirect('/account')
}

export async function accountLogoutAction() {
  await removeToken()
  redirect('/')
}
