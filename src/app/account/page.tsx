import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentCustomer } from '@/server/queries/customers'
import { accountLogoutAction } from '@/server/actions/account-auth'
import { updateCustomerProfile } from '@/server/actions/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'

export default async function AccountPage() {
  const customer = await getCurrentCustomer()

  if (!customer) {
    redirect('/account/login')
  }

  return (
    <main className="min-h-screen bg-background px-5 py-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Icon name="arrow-left" className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tu cuenta</h1>
        <p className="text-muted-foreground">Gestiona tu perfil y revisa tus pedidos.</p>

        <Card variant="outline" className="mt-6">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateCustomerProfile} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={customer.name ?? ''}
                  placeholder="Cómo te llaman"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={customer.phone ?? ''}
                  placeholder="Para avisarte cuando esté listo"
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full">
                Guardar cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href="/account/orders">
            <Card variant="outline" className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
                  <Icon name="receipt" className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Historial</p>
                  <p className="text-sm text-muted-foreground">Ver pedidos pasados</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <form action={accountLogoutAction}>
            <Button type="submit" variant="outline" className="h-full w-full justify-start gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-foreground">
                <Icon name="x" className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Cerrar sesión</p>
                <p className="text-sm text-muted-foreground">Salir de tu cuenta</p>
              </div>
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
