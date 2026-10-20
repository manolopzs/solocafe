import { api } from '@/lib/api/client'

export class KdsAlerts {
  static play(): void {
    try {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      osc.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = 880
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
      osc.onended = () => {
        void ctx.close()
      }
    } catch {
      // Ignore audio errors. The ticket still appears on the board.
    }
  }

  static async enable(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof Notification === 'undefined') return 'unsupported'
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied') return 'denied'
    return Notification.requestPermission()
  }

  static notify(count: number): void {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    const title = count === 1 ? 'Nuevo pedido' : `${count} pedidos nuevos`
    const body = count === 1
      ? 'Hay un pedido nuevo en cocina.'
      : 'Hay pedidos nuevos en cocina.'
    new Notification(title, { body, tag: 'kds-new-order' })
  }

  static async register(shopId: string, vapidPublicKey: string | null): Promise<void> {
    if (!vapidPublicKey || typeof navigator === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const registration = await navigator.serviceWorker.register('/kds-sw.js')
    const existing = await registration.pushManager.getSubscription()
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: KdsAlerts.applicationServerKey(vapidPublicKey),
    })
    const json = subscription.toJSON()
    await api.post(`/shops/${shopId}/push_devices`, {
      push_device: {
        platform: 'web',
        endpoint: subscription.endpoint,
        keys: {
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        },
      },
    })
  }

  static applicationServerKey(vapidPublicKey: string): ArrayBuffer {
    const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4)
    const base64 = (vapidPublicKey + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    const buffer = new ArrayBuffer(raw.length)
    const output = new Uint8Array(buffer)
    for (let index = 0; index < raw.length; index += 1) {
      output[index] = raw.charCodeAt(index)
    }
    return buffer
  }
}
