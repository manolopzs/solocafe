/** Number of characters in the pickup code the customer says and Cocina shows. */
export const PICKUP_CODE_LENGTH = 4

/**
 * The one short code for an order, shown on the customer's order screen and
 * on the Cocina ticket. Order ids are UUIDs, so this is the last four hex
 * characters, uppercased (e.g. "…-4f2a9c1b7e3d" -> "7E3D").
 */
export function pickupCode(orderId: string): string {
  const chars = orderId.replace(/[^0-9a-z]/gi, '')
  return chars.slice(-PICKUP_CODE_LENGTH).toUpperCase()
}
