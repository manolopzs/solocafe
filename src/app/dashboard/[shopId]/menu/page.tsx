import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getFullMenu } from '@/server/queries/menu'
import { CategoryList } from '@/components/menu/category-list'
import { ItemList } from '@/components/menu/item-list'
import { ModifierList } from '@/components/menu/modifier-list'

export const instant = false

export default async function MenuPage({
  params,
}: {
  params: Promise<{ shopId: string }>
}) {
  const { shopId } = await params
  const shop = await getShopById(shopId)
  if (!shop) notFound()

  const menu = await getFullMenu(shopId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Menu</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Administra categorias, productos y modificadores.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-zinc-900">Categorias</h2>
        <div className="mt-3">
          <CategoryList shopId={shopId} categories={menu.categories} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900">Productos</h2>
        <div className="mt-3">
          <ItemList shopId={shopId} items={menu.items} categories={menu.categories} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-zinc-900">Modificadores</h2>
        <div className="mt-3">
          <ModifierList shopId={shopId} groups={menu.modifierGroups} options={menu.modifierOptions} />
        </div>
      </section>
    </div>
  )
}
