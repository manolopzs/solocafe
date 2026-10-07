'use client'

import { useEffect, useState } from 'react'
import QRCodeLib from 'qrcode'

export function QrCode({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCodeLib.toDataURL(url, { width: 256, margin: 2 }).then(setDataUrl)
  }, [url])

  if (!dataUrl) return <div className="h-64 w-64 animate-pulse rounded-lg bg-zinc-100" />

  return (
    <img
      src={dataUrl}
      alt="Codigo QR para ordenar"
      className="h-64 w-64 rounded-lg border border-zinc-200"
    />
  )
}
