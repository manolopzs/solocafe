import { CUSTOMER_TIME_ZONE } from '@/lib/ordering'

/** "Buenos días" until 14:00, "Buenas tardes" until 21:00, then "Buenas noches", in Madrid time. */
export function greetingFor(date: Date, timeZone: string = CUSTOMER_TIME_ZONE): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(date),
  )
  if (hour >= 6 && hour < 14) return 'Buenos días'
  if (hour >= 14 && hour < 21) return 'Buenas tardes'
  return 'Buenas noches'
}
