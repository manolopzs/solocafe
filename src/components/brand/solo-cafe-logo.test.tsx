/** @jest-environment jsdom */
import fs from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import manifest from '@/app/manifest'
import { SoloCafeWordmark, SoloIconTile } from './solo-cafe-logo'
import { ShopDirectory } from '@/components/explore/shop-directory'
import { OrderStatusClient } from '@/components/order/order-status-client'
import RootLoading from '@/app/loading'
import type { Order } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default({ children, href }: { children: ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  },
}))

jest.mock('@/server/queries/orders', () => ({
  getOrderWithItems: jest.fn(async () => null),
}))

const root = path.join(__dirname, '..', '..', '..')

function pngSize(file: string) {
  const buffer = fs.readFileSync(path.join(root, file))
  expect(buffer.subarray(1, 4).toString()).toBe('PNG')
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)]
}

describe('Solo Café logo', () => {
  it('draws the chip wordmark as one labelled image at the header size', () => {
    render(<SoloCafeWordmark height={24} />)
    const logo = screen.getByRole('img', { name: 'Solo Café' })
    expect(logo).toHaveAttribute('height', '24')
    expect(logo).toHaveAttribute('width', '102')
    expect(logo.querySelectorAll('path')).toHaveLength(4)
  })

  it('shows the wordmark in the Explore header instead of the coffee icon', () => {
    render(<ShopDirectory sort="name" shops={[]} />)
    expect(screen.getByRole('img', { name: 'Solo Café' })).toBeInTheDocument()
    expect(screen.queryByText('Solo Café')).not.toBeInTheDocument()
  })

  it('shows the SO/LO tile on the loading screen', () => {
    render(<RootLoading />)
    expect(screen.getByRole('img', { name: 'Solo Café' })).toBeInTheDocument()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('keeps the cafe name, not our logo, on the Listo screen', () => {
    const order = {
      id: 'a1b2c3d4-0000-4000-8000-00000000c0de', shop_id: 'shop-1',
      shop: { name: 'Cafetería de prueba', slug: 'prueba' }, status: 'ready', customer_id: null,
      customer_name: null, pickup_type: 'asap', subtotal_cents: 350, total_cents: 350, currency: 'eur',
      created_at: new Date().toISOString(), loyalty: null, items: [],
    } as unknown as Order & { items: [] }
    render(<OrderStatusClient initialOrder={order} />)
    expect(screen.getByText('Cafetería de prueba')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Solo Café' })).not.toBeInTheDocument()
  })

  it('renders the icon tile at its requested size', () => {
    render(<SoloIconTile size={48} />)
    expect(screen.getByRole('img', { name: 'Solo Café' })).toHaveAttribute('width', '48')
  })
})

describe('app icons and share image', () => {
  it('ships SO/LO manifest icons at their declared sizes, with a padded maskable icon', () => {
    const icons = manifest().icons ?? []
    for (const icon of icons) {
      const [w, h] = pngSize(path.join('public', icon.src))
      expect(`${w}x${h}`).toBe(icon.sizes)
    }
    expect(icons.find((icon) => icon.purpose === 'maskable')?.src).toBe('/icons/icon-maskable-512.png')
  })

  it('uses the pixel-drawn favicons and a 180px apple touch icon', () => {
    expect(pngSize('src/app/icon1.png')).toEqual([32, 32])
    expect(pngSize('src/app/icon2.png')).toEqual([16, 16])
    expect(pngSize('src/app/apple-icon.png')).toEqual([180, 180])
    expect(fs.existsSync(path.join(root, 'src/app/icon.svg'))).toBe(false)
    const ico = fs.readFileSync(path.join(root, 'src/app/favicon.ico'))
    expect(ico.readUInt16LE(4)).toBe(2)
  })

  it('uses a 1200x630 share image', () => {
    expect(pngSize('public/og-image.png')).toEqual([1200, 630])
  })
})
