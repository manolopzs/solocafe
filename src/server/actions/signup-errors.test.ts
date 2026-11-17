import { ApiError } from '@/lib/api/client'
import { signupAction } from './auth'
import { accountSignupAction } from './account-auth'

const apiPost = jest.fn()
jest.mock('@/lib/api/server', () => ({
  apiPost: (...args: unknown[]) => apiPost(...args),
  apiPatch: jest.fn(),
}))
jest.mock('@/lib/auth', () => ({ setToken: jest.fn(), removeToken: jest.fn() }))
jest.mock('next/navigation', () => ({ redirect: jest.fn(), unstable_rethrow: jest.fn() }))

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

const taken = new ApiError('["Email ya está en uso"]', 422, {
  errors: ['Email ya está en uso'],
  error_codes: { email: ['taken'] },
  code: 'email_taken',
})

describe('signup actions with an existing email', () => {
  beforeEach(() => apiPost.mockReset())

  it('owner signup returns the duplicate email state', async () => {
    apiPost.mockRejectedValueOnce(taken)
    const state = await signupAction(null, form({ email: 'a@b.es', password: 'password123', shopName: 'Solo' }))
    expect(state).toEqual({ error: 'Ya existe una cuenta con este email.', code: 'email_taken' })
  })

  it('customer signup returns the duplicate email state', async () => {
    apiPost.mockRejectedValueOnce(taken)
    const state = await accountSignupAction(null, form({ email: 'a@b.es', password: 'password123' }))
    expect(state).toEqual({ error: 'Ya existe una cuenta con este email.', code: 'email_taken' })
  })

  it('owner signup never returns the API URL', async () => {
    apiPost.mockRejectedValueOnce(new Error('https://solocafe-api.onrender.com/auth/signup: ["boom"]'))
    const state = await signupAction(null, form({ email: 'a@b.es', password: 'password123', shopName: 'Solo' }))
    expect(state).toEqual({ error: 'No hemos podido completar el registro. Inténtalo de nuevo.' })
  })
})
