import { greetingFor } from './greeting'

test('greets by the hour in Madrid', () => {
  expect(greetingFor(new Date('2026-11-16T08:30:00Z'))).toBe('Good morning') // 09:30 Madrid
  expect(greetingFor(new Date('2026-11-16T15:00:00Z'))).toBe('Good afternoon') // 16:00
  expect(greetingFor(new Date('2026-11-16T21:30:00Z'))).toBe('Good evening') // 22:30
  expect(greetingFor(new Date('2026-11-16T02:00:00Z'))).toBe('Good evening') // 03:00
})
