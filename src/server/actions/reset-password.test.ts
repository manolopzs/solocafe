import { forgotPasswordAction, resetPasswordAction } from './auth'

const apiPatch = jest.fn()
const apiPost = jest.fn()
jest.mock('@/lib/api/server', () => ({
  apiPost: (...args: unknown[]) => apiPost(...args),
  apiPatch: (...args: unknown[]) => apiPatch(...args),
}))
jest.mock('@/lib/auth', () => ({ setToken: jest.fn(), removeToken: jest.fn() }))

const redirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: (path: string) => redirect(path),
  unstable_rethrow: jest.fn(),
}))

function resetForm(from?: string) {
  const data = new FormData()
  if (from) data.set('from', from)
  data.set('token', 'tok')
  data.set('password', 'newpassword456')
  data.set('passwordConfirmation', 'newpassword456')
  return data
}

describe('resetPasswordAction', () => {
  beforeEach(() => {
    apiPatch.mockReset()
    redirect.mockReset()
  })

  it('sends customers back to the customer login', async () => {
    apiPatch.mockResolvedValueOnce({ message: 'ok', account: 'customer' })
    await resetPasswordAction(null, resetForm())
    expect(redirect).toHaveBeenCalledWith('/account/login?reset=success')
  })

  it('sends owners back to the owner login', async () => {
    apiPatch.mockResolvedValueOnce({ message: 'ok', account: 'owner' })
    await resetPasswordAction(null, resetForm())
    expect(redirect).toHaveBeenCalledWith('/auth/login?reset=success')
  })

  it('keeps the owner login when the API does not say which account it is', async () => {
    apiPatch.mockResolvedValueOnce({ message: 'ok' })
    await resetPasswordAction(null, resetForm())
    expect(redirect).toHaveBeenCalledWith('/auth/login?reset=success')
  })

  it('falls back to ?from=account when the API does not say which account it is', async () => {
    apiPatch.mockResolvedValueOnce({ message: 'ok' })
    await resetPasswordAction(null, resetForm('account'))
    expect(redirect).toHaveBeenCalledWith('/account/login?reset=success')
  })

  it('trusts the API account over the link param', async () => {
    apiPatch.mockResolvedValueOnce({ message: 'ok', account: 'owner' })
    await resetPasswordAction(null, resetForm('account'))
    expect(redirect).toHaveBeenCalledWith('/auth/login?reset=success')
  })

  it('does not redirect when the reset fails', async () => {
    apiPatch.mockRejectedValueOnce(new Error('expired'))
    const state = await resetPasswordAction(null, resetForm())
    expect(state).toHaveProperty('error')
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('forgotPasswordAction', () => {
  it('passes from=account to the API only for the customer flow', async () => {
    apiPost.mockReset()
    apiPost.mockResolvedValue({})
    const customer = new FormData()
    customer.set('email', 'a@b.es')
    customer.set('from', 'account')
    await forgotPasswordAction(null, customer)
    expect(apiPost).toHaveBeenLastCalledWith('/auth/password_resets', { email: 'a@b.es', from: 'account' }, false)

    const owner = new FormData()
    owner.set('email', 'a@b.es')
    await forgotPasswordAction(null, owner)
    expect(apiPost).toHaveBeenLastCalledWith('/auth/password_resets', { email: 'a@b.es', from: undefined }, false)
  })
})
