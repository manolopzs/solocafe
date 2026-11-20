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
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
          {products.map((product) => (
            <Link
              key={product.name}
              href="/inicio"
              className="w-full"
            >
              <Card className="landing-card-lift flex h-full items-center gap-4 overflow-hidden bg-surface-elevated p-3 sm:p-4">
                <div className="relative h-14 w-14 shrink-0 sm:h-20 sm:w-20">
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
