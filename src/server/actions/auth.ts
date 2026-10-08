'use server'

import { redirect } from 'next/navigation'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import { setToken, removeToken } from '@/lib/auth'

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Correo y contraseña son requeridos' }
  }

  try {
    const data = await apiPost<{ token: string; user: { id: string; email: string } }>(
      '/auth/login',
      { email, password },
      false
    )
    await setToken(data.token)
    redirect('/dashboard')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al iniciar sesion'
    return { error: message }
  }
}

export async function signupAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Correo y contraseña son requeridos' }
  }

  try {
    const data = await apiPost<{ token: string; user: { id: string; email: string } }>(
      '/auth/signup',
      { user: { email, password } },
      false
    )
    await setToken(data.token)
    redirect('/dashboard')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la cuenta'
    return { error: message }
  }
}

export async function logoutAction() {
  await removeToken()
  redirect('/auth/login')
}
