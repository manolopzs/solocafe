const SHELL_CACHE = 'kds-shell-v1'
const ORDERS_CACHE = 'kds-orders-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add('/dashboard'))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ORDERS_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached

        try {
          const response = await fetch(request)
          if (response.ok) {
            cache.put(request, response.clone())
          }
          return response
        } catch {
          return cached ?? new Response('Sin conexión', { status: 503, statusText: 'Service Unavailable' })
        }
      })
    )
    return
  }

  if (request.method === 'GET' && url.pathname.match(/^\/shops\/[^/]+\/orders$/)) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(ORDERS_CACHE)
            await cache.put(request, response.clone())
          }
          return response
        })
        .catch(async () => {
          const cache = await caches.open(ORDERS_CACHE)
          const cached = await cache.match(request)
          return cached ?? new Response(JSON.stringify({ orders: [], sync: {}, alerts: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        })
    )
    return
  }
})

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {}

  if (type === 'KDS_ORDERS_SYNC' && payload) {
    event.waitUntil(
      caches.open(ORDERS_CACHE).then(async (cache) => {
        const shopId = event.data.shopId || payload.orders?.[0]?.shop_id
        if (!shopId) return
        const request = new Request(`/shops/${shopId}/orders?view=kitchen`, {
          method: 'GET'
        })
        const response = new Response(JSON.stringify(payload), {
          headers: { 'Content-Type': 'application/json' }
        })
        await cache.put(request, response)
      })
    )
    return
  }

  if (type === 'KDS_GET_CACHED_ORDERS') {
    event.waitUntil(
      caches.open(ORDERS_CACHE).then(async (cache) => {
        const keys = await cache.keys()
        const request = keys.find((req) => req.url.includes('/orders?view=kitchen'))
        const cached = request ? await cache.match(request) : null
        const payload = cached ? await cached.json() : null
        event.source?.postMessage({ type: 'KDS_CACHED_ORDERS', payload })
      })
    )
    return
  }
})

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {}
  }
  const title = payload.title || 'Nuevo pedido'
  const body = payload.body || 'Hay un pedido nuevo en cocina.'
  event.waitUntil(self.registration.showNotification(title, { body, tag: 'kds-new-order', data: payload }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const payload = event.notification.data || {}
      const targetPath = payload.url || payload.path || '/dashboard'
      const targetUrl = new URL(targetPath, self.location.origin).href

      const kdsClient = windowClients.find(
        (client) => client.url.includes('/kds') || client.url.includes('/dashboard')
      )
      if (kdsClient && 'focus' in kdsClient) {
        return kdsClient.focus()
      }

      if ('openWindow' in self.clients) {
        return self.clients.openWindow(targetUrl)
      }

      return Promise.resolve()
    })
  )
})
