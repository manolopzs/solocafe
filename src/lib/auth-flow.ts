/** Which login a password reset belongs to. Customers arrive with ?from=account. */
export type LoginFlow = 'account' | 'owner'

export function loginFlowFrom(value: string | null | undefined): LoginFlow {
  return value === 'account' ? 'account' : 'owner'
}

export function loginPathFor(flow: LoginFlow) {
  return flow === 'account' ? '/account/login' : '/auth/login'
}

export const RESET_SUCCESS_MESSAGE = 'Contraseña cambiada. Entra con la nueva.'
