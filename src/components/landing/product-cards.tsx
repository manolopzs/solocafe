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
    <section className="relative z-10 -mt-16 px-4 sm:-mt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {products.map((product) => (
            <Link
              key={product.name}
              href="/inicio"
              className="w-full"
            >
              <Card className="landing-card-lift flex h-full min-h-[7.5rem] flex-col items-center gap-2 overflow-hidden bg-surface-elevated px-2 py-3 text-center sm:flex-row sm:gap-4 sm:p-4 sm:text-left">
                <div className="relative h-14 w-14 shrink-0 sm:h-20 sm:w-20">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-tight text-foreground sm:text-base">{product.name}</p>
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
