import { env } from '@/lib/env'

async function checkBackend(method: string, path: string, body?: object) {
  const url = `${env.NEXT_PUBLIC_API_URL}${path}`
  let backendStatus = 'unknown'
  let backendBody = ''
  let error = ''

  try {
    const options: RequestInit = {
      method,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
    if (body) options.body = JSON.stringify(body)
    const response = await fetch(url, options)
    backendStatus = String(response.status)
    backendBody = await response.text()
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return { url, backendStatus, backendBody, error }
}

export async function GET() {
  const health = await checkBackend('GET', '/up')
  const signup = await checkBackend('POST', '/auth/signup', {
    user: { email: 'diag@solocafe.example', password: 'password123' },
  })

  return Response.json({
    apiUrl: env.NEXT_PUBLIC_API_URL,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    health,
    signup,
  })
}
