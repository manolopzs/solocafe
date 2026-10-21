import { env } from '@/lib/env'

export async function publicGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`${response.status}`)
  }
  return response.json() as Promise<T>
}
