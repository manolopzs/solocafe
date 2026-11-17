import type { ReactElement } from 'react'
import { ShopDirectory } from '@/components/explore/shop-directory'
import InicioPage from './page'

jest.mock('next/server', () => ({ connection: jest.fn(async () => undefined) }))
jest.mock('@/server/queries/explore', () => ({
  getPublicShops: jest.fn(),
  withMenuCutouts: jest.fn(async (shops: unknown[]) => shops.map((shop) => ({ ...(shop as object), cutouts: ['/menu/cutouts/latte.png'] }))),
}))
jest.mock('@/components/explore/shop-directory', () => ({ ShopDirectory: () => null }))

const explore = jest.requireMock('@/server/queries/explore') as { getPublicShops: jest.Mock }

const shop = (slug: string, name: string) => ({
  slug,
  name,
  address: null,
  open_now: false,
  brand_color: null,
  display_font: 'inter',
  hero_photo_url: null,
})

type Props = { shops: { slug: string; cutouts: string[] }[]; title: string }

describe('/inicio', () => {
  beforeEach(() => explore.getPublicShops.mockReset())

  it('shows the only shop as a card (closed ones too) instead of redirecting', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [shop('solo-cafe', 'Solo cafe')] })
    const element = (await InicioPage()) as ReactElement<Props>
    expect(explore.getPublicShops).toHaveBeenCalledWith(undefined, { includeClosed: true })
    expect(element.type).toBe(ShopDirectory)
    expect(element.props.shops.map((s) => s.slug)).toEqual(['solo-cafe'])
    expect(element.props.shops[0].cutouts).toEqual(['/menu/cutouts/latte.png'])
    expect(element.props.title).toMatch(/^Buen(os días|as tardes|as noches)$/)
  })

  it('lists every shop when there are several', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [shop('a', 'A'), shop('b', 'B')] })
    const element = (await InicioPage()) as ReactElement<Props>
    expect(element.props.shops.map((s) => s.slug)).toEqual(['a', 'b'])
  })

  it('shows the empty directory when there are no shops', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [] })
    const element = (await InicioPage()) as ReactElement<Props>
    expect(element.props.shops).toEqual([])
  })
})
