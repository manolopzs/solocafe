'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CategoryList } from '@/components/menu/category-list'
import { ItemList } from '@/components/menu/item-list'
import { ModifierList } from '@/components/menu/modifier-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import type { FullMenu } from '@/server/queries/menu'
import type { Shop } from '@/types'

const tabs = [
  { id: 'categories', label: 'Categorias' },
  { id: 'items', label: 'Productos' },
  { id: 'modifiers', label: 'Modificadores' },
] as const

type TabId = (typeof tabs)[number]['id']

export function MenuTabs({ shop, menu }: { shop: Shop; menu: FullMenu }) {
  const [activeTab, setActiveTab] = useState<TabId>('items')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-foreground">Menu</h1>
          <p className="mt-1 text-muted-foreground">Administra categorias, productos y modificadores.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${shop.slug}`} target="_blank">
            <Icon name="external-link" className="mr-2 h-4 w-4" />
            Ver como cliente
          </Link>
        </Button>
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'relative px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
            </button>
          ))}
        </nav>
      </div>

      <Card>
        <CardContent className="p-6">
          {activeTab === 'categories' && <CategoryList shopId={shop.id} categories={menu.categories} />}
          {activeTab === 'items' && (
            <ItemList
              shopId={shop.id}
              items={menu.items}
              categories={menu.categories}
              modifierGroups={menu.modifierGroups}
              itemModifierLinks={menu.itemModifierLinks}
              currency={shop.currency}
            />
          )}
          {activeTab === 'modifiers' && (
            <ModifierList shopId={shop.id} groups={menu.modifierGroups} options={menu.modifierOptions} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
