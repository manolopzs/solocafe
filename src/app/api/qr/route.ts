import { NextRequest, NextResponse } from 'next/server'
import QRCodeLib from 'qrcode'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  const name = searchParams.get('name') || 'menu'

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const buffer = await QRCodeLib.toBuffer(url, {
      width: 1024,
      margin: 2,
      color: {
        dark: '#2C2420',
        light: '#FFFFFF',
      },
      type: 'png',
    })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-${name.toLowerCase().replace(/\s+/g, '-')}.png"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
