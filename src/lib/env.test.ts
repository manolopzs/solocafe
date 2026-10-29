import { z } from 'zod'

describe('env schema', () => {
  const normalizeEmpty = (value: unknown) => {
    if (typeof value === 'string' && value.trim().length === 0) return undefined
    return value
  }

  it('validates a localhost API URL for dev/test', () => {
    const schema = z.object({
      NEXT_PUBLIC_API_URL: z.preprocess(normalizeEmpty, z.string().url().default('http://localhost:3001')),
    })
    const result = schema.safeParse({ NEXT_PUBLIC_API_URL: 'http://localhost:3001' })
    expect(result.success).toBe(true)
  })

  it('rejects a non-URL API URL', () => {
    const schema = z.object({
      NEXT_PUBLIC_API_URL: z.preprocess(normalizeEmpty, z.string().url().default('http://localhost:3001')),
    })
    const result = schema.safeParse({ NEXT_PUBLIC_API_URL: 'not-a-url' })
    expect(result.success).toBe(false)
  })
})
