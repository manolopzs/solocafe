import { ApiError } from '@/lib/api/client'

export const SIGNUP_FALLBACK_MESSAGE = 'No hemos podido completar el registro. Inténtalo de nuevo.'
export const EMAIL_TAKEN_MESSAGE = 'Ya existe una cuenta con este email.'
export const LOGIN_INVALID_MESSAGE = 'El email o la contraseña no son correctos.'

export type SignupErrorState = { error: string; code?: 'email_taken' }

function bodyOf(err: unknown): Record<string, unknown> | undefined {
  return err instanceof ApiError ? err.body : undefined
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

// Text that must never reach users: URLs, raw JSON or missing Rails translations.
function looksRaw(text: string) {
  return /https?:\/\/|Translation missing|[{}[\]"]/.test(text)
}

export function isEmailTakenError(err: unknown) {
  const body = bodyOf(err)
  if (body?.code === 'email_taken') return true
  const codes = body?.error_codes
  if (codes && typeof codes === 'object' && stringList((codes as Record<string, unknown>).email).includes('taken')) {
    return true
  }
  // Older API builds only send messages, some with a missing es translation.
  const message = err instanceof Error ? err.message : ''
  return /email\.taken|email ya está en uso/i.test(message)
}

/** Spanish message from the API when it is safe to show, else the fallback. */
export function userFacingApiError(err: unknown, fallback: string) {
  const body = bodyOf(err)
  if (!body) return fallback
  const messages = typeof body.error === 'string' ? [body.error] : stringList(body.errors)
  if (messages.length === 0 || messages.some(looksRaw)) return fallback
  return messages.join(' ')
}

export function signupErrorState(err: unknown): SignupErrorState {
  if (isEmailTakenError(err)) return { error: EMAIL_TAKEN_MESSAGE, code: 'email_taken' }
  return { error: userFacingApiError(err, SIGNUP_FALLBACK_MESSAGE) }
}

export function loginErrorMessage(err: unknown) {
  if (err instanceof ApiError && err.status === 401) return LOGIN_INVALID_MESSAGE
  return 'No hemos podido iniciar sesión. Inténtalo de nuevo.'
}
