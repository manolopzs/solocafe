'use server'

import { redirect, unstable_rethrow } from 'next/navigation'
import { apiPost, apiPatch, apiDelete } from '@/lib/api/server'
import { setToken, removeToken } from '@/lib/auth'
import { loginErrorMessage, signupErrorState, userFacingApiError } from '@/lib/api/errors'
import { loginFlowFrom, loginPathFor } from '@/lib/auth-flow'

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Enter your email and password' }
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
    return { error: 'Enter your email, password and coffee shop name' }
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
  try {
    await apiDelete('/auth/logout')
  } catch {
    // Best-effort logout; always clear the local session.
  }
  await removeToken()
  redirect('/auth/login')
}

export async function forgotPasswordAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Enter your email' }
  }

  try {
    const from = formData.get('from') === 'account' ? 'account' : undefined
    await apiPost('/auth/password_resets', { email, from }, false)
  } catch (err) {
    return { error: userFacingApiError(err, "We couldn't send the link. Please try again.") }
  }

  return { success: 'If the email exists, you will receive instructions to reset your password.' }
}

export async function resetPasswordAction(prevState: unknown, formData: FormData) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const passwordConfirmation = formData.get('passwordConfirmation') as string

  if (!token || !password || !passwordConfirmation) {
    return { error: 'The link, password or confirmation is missing' }
  }

  if (password !== passwordConfirmation) {
    return { error: 'The passwords do not match' }
  }

  if (password.length < 8) {
    return { error: 'The password must be at least 8 characters' }
  }

  let account: string | undefined
  try {
    const data = await apiPatch<{ account?: string }>('/auth/password_resets/' + encodeURIComponent(token), { password }, false)
    account = data?.account
  } catch (err) {
    return { error: userFacingApiError(err, "We couldn't change the password. Please try again.") }
  }

  // The API account wins; the ?from=account link is the fallback for older API responses.
  const flow = account ? (account === 'customer' ? 'account' : 'owner') : loginFlowFrom(formData.get('from') as string | null)
  redirect(`${loginPathFor(flow)}?reset=success`)
}
