self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {}
  }
  const title = payload.title || 'Tu pedido está listo'
  const body = payload.body || 'Pasa a recogerlo.'
  const url = typeof payload.url === 'string' ? payload.url : '/order/'
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag: payload.order_id || 'order-ready',
      data: { url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/order/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/order/') && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    })
  )
})
