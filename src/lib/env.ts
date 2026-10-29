import { z } from 'zod'

const normalizeEmpty = (value: unknown) => {
  if (typeof value === 'string' && value.trim().length === 0) return undefined
  return value
}

const normalizeBoolean = (value: unknown) => {
  const normalized = normalizeEmpty(value)
  if (normalized === undefined) return 'false'
  const s = String(normalized).toLowerCase().trim()
  if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return 'true'
  return 'false'
}

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(normalizeEmpty, z.string().url().default('http://localhost:3001')),
  NEXT_PUBLIC_APP_URL: z.preprocess(normalizeEmpty, z.string().url().default('http://localhost:3000')),
  NEXT_PUBLIC_ENABLE_STAGE_2: z.preprocess(normalizeBoolean, z.enum(['true', 'false'])),
  STRIPE_SECRET_KEY: z.preprocess(normalizeEmpty, z.string().min(1).default('')),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.preprocess(normalizeEmpty, z.string().min(1).default('pk_test_placeholder')),
  PLATFORM_FEE_PERCENT: z.preprocess(normalizeEmpty, z.string().default('0')),
})

const rawEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENABLE_STAGE_2: process.env.NEXT_PUBLIC_ENABLE_STAGE_2,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  PLATFORM_FEE_PERCENT: process.env.PLATFORM_FEE_PERCENT,
}

const parsed = envSchema.safeParse(rawEnv)

if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors
  const invalidFields = Object.entries(fieldErrors)
    .map(([key, errors]) => `${key}: ${errors?.join(', ')}`)
    .join('\n  ')
  console.error('Invalid environment variables:\n  ' + invalidFields)
  if (process.env.NODE_ENV === 'test') {
    throw new Error(`Invalid environment variables: ${Object.keys(fieldErrors).join(', ')}`)
  }
}

// Only fail loudly on Vercel deploys. Local and GitHub CI next build may use NODE_ENV=production
// without NEXT_PUBLIC_API_URL; those artifacts are never served to customers.
const isVercelDeploy =
  process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview'
const apiUrl = parsed.success ? parsed.data.NEXT_PUBLIC_API_URL : rawEnv.NEXT_PUBLIC_API_URL

if (isVercelDeploy) {
  const missingOrLocalhost =
    typeof apiUrl !== 'string' ||
    apiUrl.trim().length === 0 ||
    apiUrl.startsWith('http://localhost')
  if (missingOrLocalhost) {
    throw new Error(
      `NEXT_PUBLIC_API_URL must be set to a non-localhost URL on Vercel. Got: ${apiUrl ?? 'undefined'}`
    )
  }
}

export const env = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof envSchema>)
