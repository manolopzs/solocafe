'use server'

import { cookies } from 'next/headers'

const TOKEN_COOKIE = 'token'
const ONE_WEEK = 60 * 60 * 24 * 7

export async function setToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_WEEK,
  })
}

export async function removeToken() {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_COOKIE)
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_COOKIE)?.value
}
