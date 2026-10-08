import { env } from '@/lib/env'

export async function GET() {
  const url = `${env.NEXT_PUBLIC_API_URL}/up`
  let backendStatus = 'unknown'
  let backendBody = ''
  let error = ''

  try {
    const response = await fetch(url, { cache: 'no-store' })
    backendStatus = String(response.status)
    backendBody = await response.text()
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return Response.json({
    apiUrl: env.NEXT_PUBLIC_API_URL,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    backendCheckUrl: url,
    backendStatus,
    backendBody,
    error,
  })
}
