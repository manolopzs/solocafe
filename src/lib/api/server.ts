'use server'

import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { ApiError } from '@/lib/api/client'

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
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const url = `${env.NEXT_PUBLIC_API_URL}${path}`
  const response = await fetch(url, { ...options, headers }).catch((err) => {
    console.error(`API fetch failed for ${url}:`, err)
    throw new ApiError('network_error', 0)
  })

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
    // The URL stays in server logs only; the thrown message can reach users.
    console.error(`API ${response.status} for ${url}: ${message}`)
    throw new ApiError(message, response.status, typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : undefined)
  }

  return body as T
}

export async function apiGet<T>(path: string, withAuth = true, headers?: HeadersInit): Promise<T> {
  return request<T>(path, { method: 'GET', headers }, withAuth)
}

export async function apiPost<T>(path: string, body: unknown, withAuth = true, headers?: HeadersInit): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body), headers }, withAuth)
}

export async function apiPatch<T>(path: string, body: unknown, withAuth = true): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, withAuth)
}

export async function apiForm<T>(path: string, formData: FormData, method: 'POST' | 'PATCH' = 'POST'): Promise<T> {
  return request<T>(path, { method, body: formData })
}

export async function apiPut<T>(path: string, body: unknown, withAuth = true): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, withAuth)
}

export async function apiDelete<T>(path: string, withAuth = true): Promise<T> {
  return request<T>(path, { method: 'DELETE' }, withAuth)
}
