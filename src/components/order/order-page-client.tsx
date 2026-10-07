'use client'

import { useState, useMemo } from 'react'
import { createOrder } from '@/server/actions/orders'
import type { Shop, MenuCategory, MenuItem, ModifierGroup, ModifierOption, ItemModifierLink } from '@/types'

interface CartLine {
  item: MenuItem
  quantity: number
  modifiers: ModifierOption[]
}

export function OrderPageClient({
  shop,
  categories,
  items,
  modifierGroups,
  modifierOptions,
  itemModifierLinks,
}: {
  shop: Shop
  categories: MenuCategory[]
  items: MenuItem[]
  modifierGroups: ModifierGroup[]
  modifierOptions: ModifierOption[]
  itemModifierLinks: ItemModifierLink[]
}) {
  const [cart, setCart] = useState<CartLine[]>([])
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null)
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({})
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const groupsForItem = (itemId: string) => {
    const linkIds = itemModifierLinks.filter((l) => l.item_id === itemId).map((l) => l.group_id)
    return modifierGroups.filter((g) => linkIds.includes(g.id))
  }

  const optionsForGroup = (groupId: string) => {
    return modifierOptions.filter((o) => o.group_id === groupId)
  }

  const addToCart = (item: MenuItem) => {
    const groupIds = groupsForItem(item.id).map((g) => g.id)
    const chosen: ModifierOption[] = []
    for (const gid of groupIds) {
      const selected = selectedModifiers[gid] ?? []
      for (const optId of selected) {
        const option = modifierOptions.find((o) => o.id === optId)
        if (option) chosen.push(option)
      }
    }

    setCart((prev) => {
      const existing = prev.find((l) => l.item.id === item.id && JSON.stringify(l.modifiers.map(m => m.id).sort()) === JSON.stringify(chosen.map(m => m.id).sort()))
      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...l, quantity: l.quantity + 1 } : l
        )
      }
      return [...prev, { item, quantity: 1, modifiers: chosen }]
    })
    setActiveItem(null)
    setSelectedModifiers({})
  }

  const removeLine = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  const totalCents = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const modifierTotal = line.modifiers.reduce((m, mod) => m + mod.price_cents, 0)
        return sum + (line.item.price_cents + modifierTotal) * line.quantity
      }, 0),
    [cart]
  )

  const handleSubmit = async () => {
    if (!customerName) {
      setError('Ingresa tu nombre')
      return
    }
    setLoading(true)
    setError(null)

    try {
      await createOrder({
        shop_id: shop.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        pickup_type: 'asap',
        special_instructions: specialInstructions,
        items: cart.map((line) => ({
          item_id: line.item.id,
          quantity: line.quantity,
          modifier_option_ids: line.modifiers.map((m) => m.id),
        })),
      })
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Error al crear el pedido')
    }
  }

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const category of categories) {
      map.set(category.id, items.filter((i) => i.category_id === category.id))
    }
    map.set('uncategorized', items.filter((i) => !i.category_id))
    return map
  }, [categories, items])

  return (
    <div className="min-h-screen bg-zinc-50 pb-40">
      <header className="bg-white px-4 py-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">{shop.name}</h1>
        {shop.address && <p className="mt-1 text-sm text-zinc-600">{shop.address}</p>}
      </header>

      <main className="px-4 py-6">
        {categories.map((category) => {
          const categoryItems = itemsByCategory.get(category.id) ?? []
          if (categoryItems.length === 0) return null
          return (
            <section key={category.id} className="mb-8">
              <h2 className="text-lg font-semibold text-zinc-900">{category.name}</h2>
              <div className="mt-3 space-y-3">
                {categoryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="w-full rounded-xl bg-white p-4 text-left shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-900">{item.name}</h3>
                        {item.description && <p className="mt-1 text-sm text-zinc-500">{item.description}</p>}
                      </div>
                      <span className="font-medium text-zinc-900">
                        ${(item.price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )
        })}

        {(itemsByCategory.get('uncategorized') ?? []).length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-zinc-900">Otros</h2>
            <div className="mt-3 space-y-3">
              {(itemsByCategory.get('uncategorized') ?? []).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className="w-full rounded-xl bg-white p-4 text-left shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-zinc-900">{item.name}</h3>
                      {item.description && <p className="mt-1 text-sm text-zinc-500">{item.description}</p>}
                    </div>
                    <span className="font-medium text-zinc-900">
                      ${(item.price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {activeItem && (
        <ModifierModal
          item={activeItem}
          groups={groupsForItem(activeItem.id)}
          optionsForGroup={optionsForGroup}
          selected={selectedModifiers}
          onChange={setSelectedModifiers}
          onClose={() => setActiveItem(null)}
          onAdd={() => addToCart(activeItem)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white p-4 shadow-lg">
        {cart.length > 0 && (
          <div className="mb-3 space-y-1">
            {cart.map((line, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>
                  {line.quantity}x {line.item.name}
                  {line.modifiers.length > 0 && (
                    <span className="text-zinc-500"> ({line.modifiers.map((m) => m.name).join(', ')})</span>
                  )}
                </span>
                <button onClick={() => removeLine(idx)} className="text-red-600">Quitar</button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-3 grid grid-cols-2 gap-2">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Tu nombre"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Telefono"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="Instrucciones especiales"
          className="mb-3 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          rows={2}
        />

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={cart.length === 0 || loading}
          className="w-full rounded-lg bg-zinc-900 py-3 text-base font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Procesando...' : `Pagar ${shop.currency} ${(totalCents / 100).toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

function ModifierModal({
  item,
  groups,
  optionsForGroup,
  selected,
  onChange,
  onClose,
  onAdd,
}: {
  item: MenuItem
  groups: ModifierGroup[]
  optionsForGroup: (groupId: string) => ModifierOption[]
  selected: Record<string, string[]>
  onChange: (s: Record<string, string[]>) => void
  onClose: () => void
  onAdd: () => void
}) {
  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    const current = selected[groupId] ?? []
    if (current.includes(optionId)) {
      onChange({ ...selected, [groupId]: current.filter((id) => id !== optionId) })
    } else {
      const next = maxSelect === 1 ? [optionId] : [...current, optionId]
      onChange({ ...selected, [groupId]: next.slice(0, maxSelect) })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <button onClick={onClose} className="text-zinc-500">Cerrar</button>
        </div>

        {groups.map((group) => (
          <div key={group.id} className="mb-4">
            <h4 className="text-sm font-medium text-zinc-700">{group.name}</h4>
            <div className="mt-2 space-y-2">
              {optionsForGroup(group.id).map((option) => {
                const isSelected = (selected[group.id] ?? []).includes(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(group.id, option.id, group.max_select)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                      isSelected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200'
                    }`}
                  >
                    <span>{option.name}</span>
                    <span>+${(option.price_cents / 100).toFixed(2)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="w-full rounded-lg bg-zinc-900 py-3 text-base font-medium text-white"
        >
          Agregar ${(item.price_cents / 100).toFixed(2)}
        </button>
      </div>
    </div>
  )
}
