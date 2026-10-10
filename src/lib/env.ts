import { z } from 'zod'

const normalizeEmpty = (value: unknown) => {
  if (typeof value === 'string' && value.trim().length === 0) return undefined
  return value
}

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(normalizeEmpty, z.string().url()),
  NEXT_PUBLIC_APP_URL: z.preprocess(normalizeEmpty, z.string().url().default('http://localhost:3000')),
  NEXT_PUBLIC_ENABLE_STAGE_2: z.preprocess(normalizeEmpty, z.union([
    z.enum(['true', 'false']),
    z.enum(['True', 'False']).transform((v) => v.toLowerCase() as 'true' | 'false'),
    z.enum(['0', '1']).transform((v) => (v === '1' ? 'true' : 'false')),
  ]).default('false')),
  STRIPE_SECRET_KEY: z.preprocess(normalizeEmpty, z.string().min(1)),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.preprocess(normalizeEmpty, z.string().min(1)),
  PLATFORM_FEE_PERCENT: z.preprocess(normalizeEmpty, z.string().default('0')),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors
  const invalidFields = Object.entries(fieldErrors)
    .map(([key, errors]) => `${key}: ${errors?.join(', ')}`)
    .join('\n  ')
  console.error('Invalid environment variables:\n  ' + invalidFields)
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(`Invalid environment variables: ${Object.keys(fieldErrors).join(', ')}`)
  }
}

export const env = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof envSchema>)
