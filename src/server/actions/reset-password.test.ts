import { resetPasswordAction } from './auth'

const apiPatch = jest.fn()
jest.mock('@/lib/api/server', () => ({
  apiPost: jest.fn(),
  apiPatch: (...args: unknown[]) => apiPatch(...args),
}))
jest.mock('@/lib/auth', () => ({ setToken: jest.fn(), removeToken: jest.fn() }))

const redirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: (path: string) => redirect(path),
  unstable_rethrow: jest.fn(),
}))

function resetForm() {
  const data = new FormData()
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

  it('does not redirect when the reset fails', async () => {
    apiPatch.mockRejectedValueOnce(new Error('expired'))
    const state = await resetPasswordAction(null, resetForm())
    expect(state).toHaveProperty('error')
    expect(redirect).not.toHaveBeenCalled()
  })
})
