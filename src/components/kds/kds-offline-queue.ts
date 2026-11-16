import type { Order } from '@/types'

export interface KdsQueuedMutation {
  clientMutationId: string
  orderId: string
  shopId: string
  status: string
  queuedAt: number
}

const DB_NAME = 'kds-offline'
const DB_VERSION = 1
const STORE = 'mutations'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not available'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'clientMutationId' })
      }
    }
  })
}

export async function enqueueKdsMutation(mutation: KdsQueuedMutation): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const request = store.put(mutation)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function listKdsMutations(): Promise<KdsQueuedMutation[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const request = store.getAll()
    request.onsuccess = () => {
      const items = (request.result as KdsQueuedMutation[]).sort((a, b) => a.queuedAt - b.queuedAt)
      resolve(items)
    }
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function removeKdsMutation(clientMutationId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const request = store.delete(clientMutationId)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export async function clearKdsQueue(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const request = store.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}

export class KdsOfflineQueue {
  static isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) return true
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      return (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('abort') ||
        message.includes('failed to')
      )
    }
    return false
  }

  static mergeOrderAfterSync(localOrder: Order | undefined, serverOrder: Order): Order {
    if (!localOrder) return serverOrder
    return {
      ...localOrder,
      ...serverOrder,
      items: serverOrder.items ?? localOrder.items,
    }
  }
}
