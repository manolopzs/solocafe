'use server'

import { redirect } from 'next/navigation'
import { apiPost, apiPatch } from '@/lib/api/server'
import { setToken, removeToken } from '@/lib/auth'
import { ApiError } from '@/lib/api/client'
import { loginErrorMessage, signupErrorState, userFacingApiError } from '@/lib/api/errors'
import { isValidEmail, type EmailCodeRequestState, type EmailCodeVerifyState } from '@/lib/auth-flow'

export async function requestAccountCodeAction(prevState: unknown, formData: FormData): Promise<EmailCodeRequestState> {
  const email = String(formData.get('email') || '').trim()

  if (!isValidEmail(email)) {
    return { step: 'email', email, error: 'Enter a valid email address.' }
  }

  try {
    const data = await apiPost<{ message: string }>('/auth/code/request', { email, from: 'account' }, false)
    return { step: 'code', email, message: data.message, requestedAt: Date.now() }
  } catch (err) {
    return { step: 'email', email, error: userFacingApiError(err, "We couldn't send the code. Please try again.") }
  }
}

export async function verifyAccountCodeAction(prevState: unknown, formData: FormData): Promise<EmailCodeVerifyState> {
  const email = String(formData.get('email') || '').trim()
  const code = String(formData.get('code') || '').trim()

  if (!/^\d{6}$/.test(code)) {
    return { step: 'code', email, error: 'Enter the 6-digit code.' }
  }

  let token: string
  try {
    const data = await apiPost<{ token: string }>('/auth/code/verify', { email, code }, false)
    token = data.token
  } catch (err) {
    return {
      step: 'code',
      email,
      error: err instanceof ApiError && err.status === 401
        ? 'Invalid or expired code.'
        : userFacingApiError(err, "We couldn't verify the code. Please try again."),
    }
  }

  await setToken(token)
  redirect('/account')
}

export async function accountLoginAction(prevState: unknown, formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Enter your email and password', email }
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
    return { error: loginErrorMessage(err), email }
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
  const phone = formData.get('phone') as string

  if (!email || !password) {
    return { error: 'Enter your email and password' }
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
    return signupErrorState(err)
  }

  if (token) {
    await setToken(token)
  }

  if (name || phone) {
    try {
      await apiPatch('/customers/me', { customer: { name, phone } })
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
