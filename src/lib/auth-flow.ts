/** Which login a password reset belongs to. Customers arrive with ?from=account. */
export type LoginFlow = 'account' | 'owner'

export function loginFlowFrom(value: string | null | undefined): LoginFlow {
  return value === 'account' ? 'account' : 'owner'
}

export function loginPathFor(flow: LoginFlow) {
  return flow === 'account' ? '/account/login' : '/auth/login'
}

export const RESET_SUCCESS_MESSAGE = 'Password changed. Log in with the new one.'

export type EmailCodeRequestState = {
  step: 'email' | 'code'
  email: string
  message?: string
  error?: string
  requestedAt?: number
}

export type EmailCodeVerifyState = {
  step: 'code'
  email: string
  error?: string
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
