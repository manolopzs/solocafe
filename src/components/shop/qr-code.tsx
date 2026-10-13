'use client'

import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'

export function QrCode({
  url,
  size = 256,
  className,
}: {
  url: string
  size?: number
  className?: string
}) {
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

  if (!dataUrl) {
    return (
      <div
        className={['animate-pulse rounded-lg bg-warm-100', className].filter(Boolean).join(' ')}
        style={className ? undefined : { width: size, height: size }}
      />
    )
  }

  return (
    <img
      src={dataUrl}
      alt="Codigo QR para ordenar"
      className={['rounded-lg border border-warm-200', className].filter(Boolean).join(' ')}
      style={className ? undefined : { width: size, height: size }}
    />
  )
}
