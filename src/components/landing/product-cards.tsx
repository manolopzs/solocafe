import Link from 'next/link'
import Image from 'next/image'
import { formatMoney } from '@/lib/ordering'
import { Card } from '@/components/ui/card'

const products = [
  { name: 'Latte', cents: 200, image: '/menu/cutouts/latte.png' },
  { name: 'Cortado', cents: 200, image: '/menu/cutouts/cortado.png' },
  { name: 'Café con leche', cents: 300, image: '/menu/cutouts/cafe-con-leche.png' },
]

export function ProductCards() {
  return (
    <section className="relative z-10 -mt-20 px-6 sm:-mt-28">
      <div className="mx-auto max-w-5xl">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible">
          {products.map((product) => (
            <Link
              key={product.name}
              href="/inicio"
              className="w-[72%] shrink-0 snap-center sm:w-auto"
            >
              <Card className="landing-card-lift flex h-full items-center gap-4 overflow-hidden bg-surface-elevated p-4">
                <div className="relative h-20 w-20 shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{product.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{formatMoney(product.cents)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
