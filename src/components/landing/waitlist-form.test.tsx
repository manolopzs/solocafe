/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { api, ApiError } from '@/lib/api/client'
import { RATE_LIMITED_MESSAGE } from '@/lib/api/errors'
import { WaitlistForm } from './waitlist-form'

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href, className }: { children: ReactNode; href: string; className?: string }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  },
}))

jest.mock('@/lib/api/client', () => ({
  ...jest.requireActual('@/lib/api/client'),
  api: { post: jest.fn() },
}))

const postMock = api.post as jest.Mock

describe('WaitlistForm', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it('shows an alert for an invalid email without calling the API', () => {
    render(<WaitlistForm />)

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: 'Join waitlist' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
    expect(postMock).not.toHaveBeenCalled()
  })

  it('clears an error when the email is edited', () => {
    render(<WaitlistForm />)
    const input = screen.getByLabelText('Email address')

    fireEvent.change(input, { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: 'Join waitlist' }))
    expect(input).toHaveAttribute('aria-invalid', 'true')

    fireEvent.change(input, { target: { value: 'person@example.com' } })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('posts the trimmed email and source, then shows the success status', async () => {
    const message = "You're on the list. We'll let you know when the iOS app is out."
    postMock.mockResolvedValue({ message })
    render(<WaitlistForm />)

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: ' person@example.com ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Join waitlist' }))

    const status = await screen.findByRole('status')
    expect(postMock).toHaveBeenCalledWith(
      '/waitlist',
      { waitlist_signup: { email: 'person@example.com', source: 'landing' } },
      false,
    )
    expect(status).toHaveTextContent(message)
    expect(status).toHaveFocus()
  })

  it('shows the rate limit message for a 429 response', async () => {
    postMock.mockRejectedValue(new ApiError('Rate limited', 429))
    render(<WaitlistForm />)

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'person@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Join waitlist' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(RATE_LIMITED_MESSAGE)
  })

  it('links to the privacy policy', () => {
    render(<WaitlistForm />)

    expect(screen.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/privacidad')
  })
})
