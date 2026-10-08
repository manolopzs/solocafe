import { env } from '@/lib/env'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  if (withAuth) {
    const token = getCookie('token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const url = `${env.NEXT_PUBLIC_API_URL}${path}`
  const response = await fetch(url, { ...options, headers })

  let body: unknown
  const text = await response.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: unknown }).error)
        : typeof body === 'object' && body !== null && 'errors' in body
          ? JSON.stringify((body as { errors: unknown }).errors)
          : response.statusText
    throw new ApiError(message, response.status, body as Record<string, unknown>)
  }

  return body as T
}

export const api = {
  get: <T>(path: string, withAuth = true) =>
    request<T>(path, { method: 'GET' }, withAuth),
  post: <T>(path: string, body: unknown, withAuth = true) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, withAuth),
  patch: <T>(path: string, body: unknown, withAuth = true) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, withAuth),
  put: <T>(path: string, body: unknown, withAuth = true) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, withAuth),
  delete: <T>(path: string, withAuth = true) =>
    request<T>(path, { method: 'DELETE' }, withAuth),
}
