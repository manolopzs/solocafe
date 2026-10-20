import { KdsSync } from './kds-sync'

describe('KdsSync', () => {
  it('follows the server retry schedule until the cap', () => {
    expect(KdsSync.delayMs(0)).toBe(1000)
    expect(KdsSync.delayMs(1)).toBe(2000)
    expect(KdsSync.delayMs(2)).toBe(4000)
    expect(KdsSync.delayMs(4)).toBe(16000)
    expect(KdsSync.delayMs(5)).toBe(30000)
    expect(KdsSync.delayMs(9)).toBe(30000)
    expect(KdsSync.delayMs(-2)).toBe(1000)
  })

  it('uses the schedule returned by the kitchen endpoint', () => {
    expect(KdsSync.delayMs(0, [250, 500])).toBe(250)
    expect(KdsSync.delayMs(4, [250, 500])).toBe(500)
  })
})