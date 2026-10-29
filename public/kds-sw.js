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
