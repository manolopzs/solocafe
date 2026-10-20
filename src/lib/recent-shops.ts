export interface RecentShop {
  slug: string
  name: string
}

const STORAGE_KEY = 'solo-cafe.recent-shops'
const MAX_RECENT = 5

export const EMPTY_RECENT_SHOPS: RecentShop[] = []

const listeners = new Set<() => void>()
let snapshot: RecentShop[] = EMPTY_RECENT_SHOPS
let loaded = false

function readStored(): RecentShop[] {
  if (typeof window === 'undefined') return EMPTY_RECENT_SHOPS

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_RECENT_SHOPS
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return EMPTY_RECENT_SHOPS

    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') return []
      const slug = 'slug' in item ? item.slug : null
      const name = 'name' in item ? item.name : null
      if (typeof slug !== 'string' || typeof name !== 'string' || slug.length === 0 || name.length === 0) return []
      return [{ slug, name }]
    }).slice(0, MAX_RECENT)
  } catch {
    return EMPTY_RECENT_SHOPS
  }
}

function ensureLoaded() {
  if (loaded) return
  snapshot = readStored()
  loaded = true
}

export function getRecentSnapshot(): RecentShop[] {
  ensureLoaded()
  return snapshot
}

export function subscribeRecentShops(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function rememberShop(shop: RecentShop): RecentShop[] {
  ensureLoaded()
  const next = [shop, ...snapshot.filter((item) => item.slug !== shop.slug)].slice(0, MAX_RECENT)
  const unchanged =
    next.length === snapshot.length &&
    next.every((item, index) => item.slug === snapshot[index]?.slug && item.name === snapshot[index]?.name)
  snapshot = next
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  if (!unchanged) listeners.forEach((listener) => listener())
  return next
}
