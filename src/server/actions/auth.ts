'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { apiPost, apiPatch } from '@/lib/api/server'
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
  const shopName = String(formData.get('shopName') || '').trim()

  if (!email || !password || !shopName) {
    return { error: 'Correo, contraseña y nombre de la cafeteria son requeridos' }
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

  try {
    await apiPost('/shops', {
      shop: { name: shopName },
      seed_starter_menu: true,
    })
  } catch (err) {
    unstable_rethrow(err)
    redirect('/dashboard/onboarding')
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  await removeToken()
  redirect('/auth/login')
}

export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'El correo electrónico es requerido' }
  }

  try {
    await apiPost('/auth/password_resets', { email }, false)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al solicitar el restablecimiento'
    return { error: message }
  }

  return { success: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.' }
}

export async function resetPasswordAction(prevState: unknown, formData: FormData) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const passwordConfirmation = formData.get('passwordConfirmation') as string

  if (!token || !password || !passwordConfirmation) {
    return { error: 'Token, contraseña y confirmación son requeridos' }
  }

  if (password !== passwordConfirmation) {
    return { error: 'Las contraseñas no coinciden' }
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }

  try {
    await apiPatch('/auth/password_resets/' + encodeURIComponent(token), { password }, false)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al restablecer la contraseña'
    return { error: message }
  }

  redirect('/auth/login?reset=success')
}
