'use client'

import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'

export function QrCode({ url, size = 256 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCodeLib.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#2C2420',
        light: '#FFFFFF',
      },
    }).then(setDataUrl)
  }, [url, size])

  if (!dataUrl) return <div className="animate-pulse rounded-lg bg-warm-100" style={{ width: size, height: size }} />

  return (
    <img
      src={dataUrl}
      alt="Codigo QR para ordenar"
      className="rounded-lg border border-warm-200"
      style={{ width: size, height: size }}
    />
  )
}
