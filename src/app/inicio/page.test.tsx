import type { ReactElement } from 'react'
import { ShopDirectory } from '@/components/explore/shop-directory'
import InicioPage from './page'

jest.mock('next/server', () => ({ connection: jest.fn(async () => undefined) }))
jest.mock('next/navigation', () => ({
  redirect: jest.fn((href: string) => {
    throw new Error(`redirect:${href}`)
  }),
}))
jest.mock('@/server/queries/explore', () => ({ getPublicShops: jest.fn() }))
jest.mock('@/components/explore/shop-directory', () => ({ ShopDirectory: () => null }))

const explore = jest.requireMock('@/server/queries/explore') as { getPublicShops: jest.Mock }

const shop = (slug: string, name: string) => ({
  slug,
  name,
  address: null,
  open_now: false,
  brand_color: '#3d2b1f',
  display_font: 'inter',
  hero_photo_url: null,
})

describe('/inicio', () => {
  beforeEach(() => explore.getPublicShops.mockReset())

  it('opens the menu of the only shop, even when it is closed', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [shop('solo-cafe', 'Solo cafe')] })
    await expect(InicioPage()).rejects.toThrow('redirect:/solo-cafe')
    expect(explore.getPublicShops).toHaveBeenCalledWith(undefined, { includeClosed: true })
  })

  it('lists the shops when there are several', async () => {
    const shops = [shop('a', 'A'), shop('b', 'B')]
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops })
    const element = (await InicioPage()) as ReactElement<{ shops: unknown[] }>
    expect(element.type).toBe(ShopDirectory)
    expect(element.props.shops).toEqual(shops)
  })

  it('shows the empty directory when there are no shops', async () => {
    explore.getPublicShops.mockResolvedValue({ sort: 'name', shops: [] })
    const element = (await InicioPage()) as ReactElement<{ shops: unknown[] }>
    expect(element.props.shops).toEqual([])
  })
})
