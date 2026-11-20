import { ApiError } from '@/lib/api/client'
import {
  EMAIL_TAKEN_MESSAGE,
  LOGIN_INVALID_MESSAGE,
  RATE_LIMITED_MESSAGE,
  SIGNUP_FALLBACK_MESSAGE,
  loginErrorMessage,
  signupErrorState,
  userFacingApiError,
} from './errors'

const prodRawMessage =
  '["Email Translation missing: es.activerecord.errors.models.user.attributes.email.taken"]'

describe('signupErrorState', () => {
  it('maps the email_taken code to the duplicate email message', () => {
    const err = new ApiError('["Email is already in use"]', 422, {
      errors: ['Email is already in use'],
      error_codes: { email: ['taken'] },
      code: 'email_taken',
    })
    expect(signupErrorState(err)).toEqual({ error: EMAIL_TAKEN_MESSAGE, code: 'email_taken' })
  })

  it('recognises duplicate email from error_codes alone', () => {
    const err = new ApiError('x', 422, { errors: ['x'], error_codes: { email: ['taken'] } })
    expect(signupErrorState(err).code).toBe('email_taken')
  })

  it('recognises duplicate email from the current production API body', () => {
    const err = new ApiError(prodRawMessage, 422, { errors: [prodRawMessage.slice(2, -2)] })
    expect(signupErrorState(err)).toEqual({ error: EMAIL_TAKEN_MESSAGE, code: 'email_taken' })
  })

  it('shows translated validation messages from the API', () => {
    const err = new ApiError('x', 422, { errors: ['Email is invalid'], error_codes: { email: ['invalid'] } })
    expect(signupErrorState(err)).toEqual({ error: 'Email is invalid' })
  })

  it('falls back when the API sends a missing translation', () => {
    const err = new ApiError('x', 422, { errors: ['Email Translation missing: en.errors.messages.invalid'] })
    expect(signupErrorState(err)).toEqual({ error: SIGNUP_FALLBACK_MESSAGE })
  })

  it('never shows a URL or raw JSON', () => {
    const errors = [
      new Error(`https://solocafe-api.onrender.com/auth/signup: ${JSON.stringify(['Boom'])}`),
      new ApiError('network_error', 0),
      new ApiError('Internal Server Error', 500),
      new ApiError('x', 422, { errors: ['See https://example.com'] }),
      new ApiError('x', 422, { errors: { email: ['bad'] } }),
      'not an error',
    ]
    for (const err of errors) {
      const { error } = signupErrorState(err)
      expect(error).toBe(SIGNUP_FALLBACK_MESSAGE)
    }
  })

  it('maps 429 to the rate-limited message', () => {
    const err = new ApiError('Too Many Requests', 429, { error: 'Too Many Requests' })
    expect(signupErrorState(err)).toEqual({ error: RATE_LIMITED_MESSAGE })
  })
})

describe('userFacingApiError', () => {
  it('uses an English error string from the API', () => {
    const err = new ApiError('x', 422, { error: 'The reset link is invalid or has expired.' })
    expect(userFacingApiError(err, 'fallback')).toBe('The reset link is invalid or has expired.')
  })

  it('maps 429 to the rate-limited message', () => {
    const err = new ApiError('Too Many Requests', 429, { error: 'Too Many Requests' })
    expect(userFacingApiError(err, 'fallback')).toBe(RATE_LIMITED_MESSAGE)
  })

  it('falls back for plain errors', () => {
    expect(userFacingApiError(new Error('https://api/x: boom'), 'fallback')).toBe('fallback')
  })
})

describe('loginErrorMessage', () => {
  it('maps 401 to a Spanish wrong credentials message', () => {
    expect(loginErrorMessage(new ApiError('Invalid email or password', 401, { error: 'Invalid email or password' }))).toBe(
      LOGIN_INVALID_MESSAGE,
    )
  })

  it('maps 429 to the rate-limited message', () => {
    expect(loginErrorMessage(new ApiError('Too Many Requests', 429, { error: 'Too Many Requests' }))).toBe(RATE_LIMITED_MESSAGE)
  })

  it('uses a generic message for anything else', () => {
    const message = loginErrorMessage(new Error('https://solocafe-api.onrender.com/auth/login: boom'))
    expect(message).not.toMatch(/https?:|boom/)
  })
})
