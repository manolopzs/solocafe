import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { getFullMenu } from '@/server/queries/menu'
import { CategoryList } from '@/components/menu/category-list'
import { ItemList } from '@/components/menu/item-list'
import { ModifierList } from '@/components/menu/modifier-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">Menu</h1>
        <p className="mt-1 text-muted-foreground">
          Administra categorias, productos y modificadores.
        </p>
      </div>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
          <CardDescription>Agrupa tus productos para que los clientes los encuentren facil.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList shopId={shopId} categories={menu.categories} />
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>Agrega fotos, precios y disponibilidad.</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemList
            shopId={shopId}
            items={menu.items}
            categories={menu.categories}
            modifierGroups={menu.modifierGroups}
            itemModifierLinks={menu.itemModifierLinks}
            currency={shop.currency}
          />
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Modificadores</CardTitle>
          <CardDescription>Opciones como tamano, leche o extras.</CardDescription>
        </CardHeader>
        <CardContent>
          <ModifierList shopId={shopId} groups={menu.modifierGroups} options={menu.modifierOptions} />
        </CardContent>
      </Card>
    </div>
  )
}
