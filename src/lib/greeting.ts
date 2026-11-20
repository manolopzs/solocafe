import { CUSTOMER_TIME_ZONE } from '@/lib/ordering'

/** "Good morning" until 14:00, "Good afternoon" until 21:00, then "Good evening", in Madrid time. */
export function greetingFor(date: Date, timeZone: string = CUSTOMER_TIME_ZONE): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(date),
  )
  if (hour >= 6 && hour < 14) return 'Good morning'
  if (hour >= 14 && hour < 21) return 'Good afternoon'
  return 'Good evening'
}
