import { env } from '@/lib/env'

export function isStage2Enabled(): boolean {
  return env.NEXT_PUBLIC_ENABLE_STAGE_2 === 'true'
}
