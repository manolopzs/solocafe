import { logoutAction } from './auth'

const apiDelete = jest.fn()
const removeToken = jest.fn()
jest.mock('@/lib/api/server', () => ({
  apiDelete: (...args: unknown[]) => apiDelete(...args),
}))
jest.mock('@/lib/auth', () => ({ setToken: jest.fn(), removeToken: () => removeToken() }))

const redirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: (path: string) => redirect(path),
  unstable_rethrow: jest.fn(),
}))

describe('logoutAction', () => {
  beforeEach(() => {
    apiDelete.mockReset()
    removeToken.mockReset()
    redirect.mockReset()
  })

  it('calls the API logout before clearing the cookie', async () => {
    apiDelete.mockResolvedValueOnce({})
    await logoutAction()
    expect(apiDelete).toHaveBeenCalledWith('/auth/logout')
    expect(removeToken).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/auth/login')
  })

  it('still clears the cookie when the API logout fails', async () => {
    apiDelete.mockRejectedValueOnce(new Error('network'))
    await logoutAction()
    expect(apiDelete).toHaveBeenCalledWith('/auth/logout')
    expect(removeToken).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/auth/login')
  })
})
