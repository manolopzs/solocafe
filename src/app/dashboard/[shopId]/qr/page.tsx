import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getShopById } from '@/server/queries/shops'
import { QrCode } from '@/components/shop/qr-code'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export const instant = false

export default async function QrPage({
  params,
}: {
  params: Promise<{ shopId: string }>
}) {
  const { shopId } = await params
  const shop = await getShopById(shopId)
  if (!shop) notFound()

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${shop.slug}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">Codigo QR</h1>
        <p className="mt-1 text-muted-foreground">Imprime o comparte este codigo para que tus clientes ordenen.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="outline">
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
            <CardDescription>Escanea para abrir tu pagina de pedidos.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="rounded-2xl border border-warm-200 bg-white p-4 shadow-sm">
              <QrCode url={publicUrl} size={320} />
            </div>
            <p className="text-center text-sm font-medium text-foreground">{shop.name}</p>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <CardTitle>Compartir</CardTitle>
            <CardDescription>Usa el enlace o descarga el QR.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm font-medium text-foreground">
              <Icon name="external-link" className="h-4 w-4 text-warm-500" />
              <span className="truncate">{publicUrl}</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/${shop.slug}`} target="_blank">
                  <Icon name="external-link" className="mr-2 h-4 w-4" />
                  Ver pagina
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={`/api/qr?url=${encodeURIComponent(publicUrl)}&name=${encodeURIComponent(shop.name)}`} download={`qr-${shop.slug}.png`}>
                  <Icon name="copy" className="mr-2 h-4 w-4" />
                  Descargar QR
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
