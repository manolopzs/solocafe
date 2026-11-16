import { PICKUP_CODE_LENGTH, pickupCode } from './pickup-code'

describe('pickupCode', () => {
  it('uses the last four characters of a UUID, uppercased', () => {
    expect(pickupCode('3f6b2c1e-9a0d-4e5f-8b7c-4f2a9c1b7e3d')).toBe('7E3D')
  })

  it('always returns the same length for UUIDs', () => {
    expect(pickupCode('00000000-0000-0000-0000-000000000001')).toHaveLength(PICKUP_CODE_LENGTH)
  })

  it('ignores hyphens when the last group is short', () => {
    expect(pickupCode('order-ab-1')).toBe('RAB1')
  })

  it('is stable for the same order', () => {
    const id = 'c0ffee00-1234-4abc-9def-00000000beef'
    expect(pickupCode(id)).toBe(pickupCode(id.toUpperCase()))
  })
})
