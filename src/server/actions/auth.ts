'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { apiPost, apiPatch } from '@/lib/api/server'
import { setToken, removeToken } from '@/lib/auth'
import { loginErrorMessage, signupErrorState, userFacingApiError } from '@/lib/api/errors'

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Introduce tu correo y tu contraseña' }
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
    return { error: loginErrorMessage(err) }
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
    return { error: 'Introduce tu correo, tu contraseña y el nombre de la cafetería' }
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
    return signupErrorState(err)
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
    return { error: 'Introduce tu correo electrónico' }
  }

  try {
    await apiPost('/auth/password_resets', { email }, false)
  } catch (err) {
    return { error: userFacingApiError(err, 'No hemos podido enviar el enlace. Inténtalo de nuevo.') }
  }

  return { success: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.' }
}

export async function resetPasswordAction(prevState: unknown, formData: FormData) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const passwordConfirmation = formData.get('passwordConfirmation') as string

  if (!token || !password || !passwordConfirmation) {
    return { error: 'Faltan el enlace, la contraseña o su confirmación' }
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
    return { error: userFacingApiError(err, 'No hemos podido cambiar la contraseña. Inténtalo de nuevo.') }
  }

  redirect('/auth/login?reset=success')
}
