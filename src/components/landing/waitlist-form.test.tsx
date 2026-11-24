/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ApiError } from '@/lib/api/client'
import { WaitlistForm, waitlistErrorMessage } from './waitlist-form'

const post = jest.fn()
jest.mock('@/lib/api/client', () => {
  const actual = jest.requireActual('@/lib/api/client')
  return { ...actual, api: { post: (...args: unknown[]) => post(...args) } }
})

function submit(email: string) {
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: email } })
  fireEvent.click(screen.getByRole('button', { name: 'Join the waitlist' }))
}

describe('WaitlistForm', () => {
  beforeEach(() => post.mockReset())

  it('rejects an invalid email without calling the API', () => {
    render(<WaitlistForm />)
    submit('not-an-email')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
    expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true')
    expect(post).not.toHaveBeenCalled()
  })

  it('posts the trimmed email with its source and shows the success message', async () => {
    post.mockResolvedValueOnce({ message: "You're on the list." })
    render(<WaitlistForm source="landing" />)
    await act(async () => submit('  me@example.com '))
    expect(post).toHaveBeenCalledWith('/waitlist', { waitlist_signup: { email: 'me@example.com', source: 'landing' } }, false)
    expect(screen.getByRole('status')).toHaveTextContent("You're on the list.")
    expect(screen.queryByLabelText('Email address')).not.toBeInTheDocument()
  })

  it('shows the rate limit message on 429', async () => {
    post.mockRejectedValueOnce(new ApiError('Too many', 429))
    render(<WaitlistForm />)
    await act(async () => submit('me@example.com'))
    expect(screen.getByRole('alert')).toHaveTextContent('Too many attempts. Please wait a few minutes and try again.')
  })

  it('links the privacy page', () => {
    render(<WaitlistForm />)
    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacidad')
  })
})

describe('waitlistErrorMessage', () => {
  it('maps API validation errors to a plain message and anything else to the fallback', () => {
    expect(waitlistErrorMessage(new ApiError('x', 422))).toBe('Enter a valid email address.')
    expect(waitlistErrorMessage(new TypeError('Failed to fetch'))).toBe("We couldn't add you to the list. Please try again.")
  })
})
