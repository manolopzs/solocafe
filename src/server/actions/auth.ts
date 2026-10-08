'use server'

import { redirect } from 'next/navigation'
import { apiPost } from '@/lib/api/server'
import { setToken, removeToken } from '@/lib/auth'

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Correo y contraseña son requeridos' }
  }

  let token: string | undefined
  try {
    const data = await apiPost<{ token: string; user: { id: string; email: string } }>(
      '/auth/login',
      { email, password },
      false
    )
    token = data.token
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al iniciar sesion'
    return { error: message }
  }

  if (token) {
    await setToken(token)
  }
  redirect('/dashboard')
}

export async function signupAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Correo y contraseña son requeridos' }
  }

  let token: string | undefined
  try {
    const data = await apiPost<{ token: string; user: { id: string; email: string } }>(
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
  redirect('/dashboard')
}

export async function logoutAction() {
  await removeToken()
  redirect('/auth/login')
}
