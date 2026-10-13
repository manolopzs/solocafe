import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { MobileNav } from "@/components/landing/mobile-nav";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Icon name="coffee" className="h-5 w-5" />
            </div>
            <span className="font-sans text-xl font-semibold tracking-tight text-foreground">
              Solo Cafe
            </span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <Link href="#plataforma" className="hover:text-foreground">Plataforma</Link>
            <Link href="#clientes" className="hover:text-foreground">Clientes</Link>
            <Link href="#cafeterias" className="hover:text-foreground">Cafeterías</Link>
            <Link href="#precios" className="hover:text-foreground">Precios</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex whitespace-nowrap">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="whitespace-nowrap">
              <Link href="/auth/signup">Empezar gratis</Link>
            </Button>
            <MobileNav />
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[#f0f4f8] px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-xs">
            <Icon name="coffee" className="h-4 w-4 text-accent" />
            <span>Conectamos personas y lugares en el momento presente</span>
          </div>
          <h1 className="mx-auto max-w-4xl font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-6xl sm:leading-[1.1]">
            Tu café, listo cuando llegues
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Clientes que ordenan y pagan desde su celular. Tú recibes el pedido, lo preparas y ellos recogen sin filas. Pago directo a tu cuenta.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/signup">Empieza gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full bg-background sm:w-auto">
              <Link href="/demo">Ver demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="plataforma" className="bg-[#f0f4f8] px-6 pb-20 sm:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Pedidos, cocina y pago en un solo flujo
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Solo Cafe conecta a tus clientes con tu cafetería: ordenan por adelantado, tú recibes el pedido en la cocina y el pago va directo a tu cuenta.
            </p>
          </div>

          <div className="relative hidden items-stretch gap-4 lg:flex">
            <SidePanel
              label="Cafetería"
              title="Recibe y gestiona pedidos"
              description="Dashboard, KDS y QR en un solo lugar."
              mockup={<DashboardMockup />}
            />

            <div className="flex flex-1 flex-col justify-center">
              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon name="coffee" className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-sans text-lg font-semibold text-foreground">Solo Cafe</h3>
                    <p className="text-sm text-muted-foreground">Plataforma de pedidos</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <PlatformFeature icon="store" text="Tu propia página de pedidos" />
                  <PlatformFeature icon="credit-card" text="Pagos directos a tu cuenta" />
                  <PlatformFeature icon="utensils" text="KDS en tiempo real" />
                </div>
              </div>
              <div className="relative mt-4 flex items-center justify-center">
                <div className="absolute left-0 right-0 top-1/2 -z-10 h-px border-t-2 border-dashed border-border" />
                <div className="h-3 w-3 rounded-full border-2 border-border bg-background" />
              </div>
            </div>

            <SidePanel
              label="Clientes"
              title="Ordenan desde su celular"
              description="Pagan por adelantado y recogen sin filas."
              mockup={<PhoneMockup />}
            />
          </div>

          <div className="grid gap-6 lg:hidden">
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon name="coffee" className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-semibold text-foreground">Solo Cafe</h3>
                  <p className="text-sm text-muted-foreground">Plataforma de pedidos</p>
                </div>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <SidePanel
                label="Cafetería"
                title="Recibe y gestiona pedidos"
                description="Dashboard, KDS y QR en un solo lugar."
                mockup={<DashboardMockup />}
              />
              <SidePanel
                label="Clientes"
                title="Ordenan desde su celular"
                description="Pagan por adelantado y recogen sin filas."
                mockup={<PhoneMockup />}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="clientes" className="bg-background px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Para tus clientes</p>
            <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Acceso instantáneo a tu café
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Escanea el QR, elige tu bebida favorita, paga y recoge sin filas. Sin apps que descargar, sin registros obligatorios.
            </p>
            <ul className="mt-8 space-y-4">
              <BenefitItem text="Menú simple de 5 a 7 opciones con fotos y precios" />
              <BenefitItem text="Paga con Apple Pay, Google Pay o tarjeta en segundos" />
              <BenefitItem text="Recibe tu pedido listo al llegar a la cafetería" />
              <BenefitItem text="Notificación cuando tu café está listo para recoger" />
            </ul>
            <div className="mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/demo">Ver cómo ordenan tus clientes</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <PhoneMockupLarge />
          </div>
        </div>
      </section>

      <section id="cafeterias" className="bg-[#f8fafc] px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="order-2 flex justify-center lg:order-1">
            <DashboardMockupLarge />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Para tu cafetería</p>
            <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Más tráfico, operación optimizada
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Lleva más clientes a tu tienda y sirve más pedidos por hora. Define tu menú, fija tu capacidad y recibe pagos directos en tu cuenta.
            </p>
            <ul className="mt-8 space-y-4">
              <BenefitItem text="Recibe pedidos pagados en tu cocina en tiempo real" />
              <BenefitItem text="Cobra directo con Stripe: Apple Pay, Google Pay y tarjeta" />
              <BenefitItem text="Define menú simple y capacidad por slot" />
              <BenefitItem text="Forecasting: pedidos, productos y patrones de horario" />
            </ul>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/auth/signup">Abrir mi cafetería gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Icon key={i} name="star" className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <blockquote className="mt-6 font-sans text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
            "Dejamos de depender de los apps de delivery. Ahora vendemos directo, conocemos a nuestros clientes y el dinero llega a nuestra cuenta desde el primer día."
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface font-semibold text-foreground">
              MR
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">María Rodríguez</p>
              <p className="text-sm text-muted-foreground">Dueña, Café de la Esquina</p>
            </div>
          </div>
        </div>
      </section>

      <section id="precios" className="bg-[#f8fafc] px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Un precio justo para lanzarnos juntos
            </h2>
            <p className="mt-4 text-muted-foreground">
              En lanzamiento trabajamos con una comisión simbólica. A escala, 1% a 3% por transacción más una tarifa mensual de servicio.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <PricingCard
              name="Lanzamiento"
              description="Para la primera cafetería que prueba Solo Cafe"
              fee="Simbólico"
              volume="Comisión reducida por pedido"
              highlighted
            />
            <PricingCard
              name="Escala"
              description="Cuando crecemos juntos"
              fee="1% - 3%"
              volume="Por transacción + tarifa mensual"
            />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No incluye costos de procesamiento de Stripe. Sin contrato.
          </p>
        </div>
      </section>

      <section className="bg-primary px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Conecta tu cafetería con tus clientes hoy
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/70">
            Crea tu cuenta gratis y empieza a recibir pedidos pagados en minutos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/auth/signup">Crear cuenta gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto">
              <Link href="/demo">Ver demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Icon name="coffee" className="h-4 w-4" />
            </div>
            <span className="font-sans font-semibold text-foreground">Solo Cafe</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Conectamos personas y lugares en el momento presente.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground">Entrar</Link>
            <Link href="/auth/signup" className="hover:text-foreground">Crear cuenta</Link>
            <Link href="/demo" className="hover:text-foreground">Demo</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PlatformFeature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <Icon name={icon as any} className="h-5 w-5 text-accent" />
      <span className="text-sm font-medium text-foreground">{text}</span>
    </div>
  );
}

function SidePanel({
  label,
  title,
  description,
  mockup,
}: {
  label: string;
  title: string;
  description: string;
  mockup: React.ReactNode;
}) {
  return (
    <Card className="flex flex-1 flex-col items-center p-6 text-center">
      <div className="mb-5 w-full">{mockup}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{label}</p>
      <h3 className="mt-2 font-sans text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
        <Icon name="check" className="h-3 w-3 text-accent" />
      </div>
      <span className="text-foreground">{text}</span>
    </li>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-amber-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
      </div>
      <div className="p-3">
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-surface p-2">
            <p className="text-[0.6rem] text-muted-foreground">Ventas</p>
            <p className="text-sm font-semibold text-foreground">$4,230</p>
          </div>
          <div className="rounded-lg bg-surface p-2">
            <p className="text-[0.6rem] text-muted-foreground">Pedidos</p>
            <p className="text-sm font-semibold text-foreground">86</p>
          </div>
          <div className="rounded-lg bg-surface p-2">
            <p className="text-[0.6rem] text-muted-foreground">Ticket</p>
            <p className="text-sm font-semibold text-foreground">$49</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-surface p-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-amber-100" />
              <div>
                <p className="text-[0.65rem] font-medium text-foreground">Cappuccino · María</p>
                <p className="text-[0.6rem] text-muted-foreground">12:34</p>
              </div>
            </div>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.55rem] font-medium text-amber-700">Prep</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface p-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100" />
              <div>
                <p className="text-[0.65rem] font-medium text-foreground">Latte · Juan</p>
                <p className="text-[0.6rem] text-muted-foreground">12:31</p>
              </div>
            </div>
            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[0.55rem] font-medium text-green-700">Listo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="mx-auto w-full max-w-[10rem] overflow-hidden rounded-[1.5rem] border-[5px] border-border bg-background shadow-lg">
      <div className="flex items-center justify-center bg-surface py-1.5">
        <div className="h-1 w-10 rounded-full bg-border" />
      </div>
      <div className="p-2.5">
        <div className="mb-2 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 p-2">
          <p className="text-[0.6rem] text-muted-foreground">Bienvenido a</p>
          <p className="text-xs font-semibold text-foreground">Café de la Esquina</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-surface p-1.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-700 to-amber-500" />
            <div className="flex-1">
              <p className="text-[0.65rem] font-medium text-foreground">Cappuccino</p>
              <p className="text-[0.6rem] text-muted-foreground">MXN 55.00</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface p-1.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-stone-600 to-stone-400" />
            <div className="flex-1">
              <p className="text-[0.65rem] font-medium text-foreground">Latte Vainilla</p>
              <p className="text-[0.6rem] text-muted-foreground">MXN 62.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockupLarge() {
  return (
    <div className="w-full max-w-[18rem] overflow-hidden rounded-[2.25rem] border-[7px] border-border bg-background shadow-2xl">
      <div className="flex items-center justify-center bg-surface py-2.5">
        <div className="h-1.5 w-16 rounded-full bg-border" />
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-foreground">
            <Icon name="store" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bienvenido a</p>
            <h3 className="font-sans text-base font-semibold text-foreground">Café de la Esquina</h3>
          </div>
        </div>
        <div className="mb-4 flex gap-2">
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Abierto</span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-foreground">Para recoger</span>
        </div>
        <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
          <span className="shrink-0 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-primary-foreground">Bebidas calientes</span>
          <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">Bebidas frías</span>
          <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">Panadería</span>
        </div>
        <p className="mb-3 font-sans text-sm font-semibold text-foreground">Bebidas calientes</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-amber-800 via-amber-600 to-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Cappuccino</p>
              <p className="text-xs text-muted-foreground truncate">Espresso doble con leche vaporizada</p>
              <p className="mt-1 text-sm font-semibold text-foreground">MXN 55.00</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-stone-700 via-stone-500 to-stone-300" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Latte Vainilla</p>
              <p className="text-xs text-muted-foreground truncate">Café suave con un toque de vainilla</p>
              <p className="mt-1 text-sm font-semibold text-foreground">MXN 62.00</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-orange-900 via-amber-800 to-amber-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Americano</p>
              <p className="text-xs text-muted-foreground truncate">Espresso con agua caliente</p>
              <p className="mt-1 text-sm font-semibold text-foreground">MXN 42.00</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="rounded-xl bg-foreground py-3 text-center text-sm font-semibold text-primary-foreground">
          Ver pedido · MXN 0.00
        </div>
      </div>
    </div>
  );
}

function DashboardMockupLarge() {
  return (
    <div className="w-full max-w-[32rem] overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-3 h-4 flex-1 rounded bg-border" />
      </div>
      <div className="flex">
        <div className="w-14 border-r border-border bg-surface py-4">
          <div className="mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded bg-border text-[0.6rem] text-muted-foreground">
            <Icon name="store" className="h-3.5 w-3.5" />
          </div>
          <div className="mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded bg-border text-[0.6rem] text-muted-foreground">
            <Icon name="receipt" className="h-3.5 w-3.5" />
          </div>
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded bg-border text-[0.6rem] text-muted-foreground">
            <Icon name="settings" className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-sans text-base font-semibold text-foreground">Panel de control</h3>
            <div className="h-7 w-7 rounded-full bg-border" />
          </div>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-surface p-3">
              <p className="text-xs text-muted-foreground">Ventas hoy</p>
              <p className="mt-1 font-sans text-lg font-semibold text-foreground">$4,230</p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <p className="text-xs text-muted-foreground">Pedidos</p>
              <p className="mt-1 font-sans text-lg font-semibold text-foreground">86</p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <p className="text-xs text-muted-foreground">Ticket promedio</p>
              <p className="mt-1 font-sans text-lg font-semibold text-foreground">$49</p>
            </div>
          </div>
          <div className="mb-4 rounded-lg bg-surface p-3">
            <p className="mb-2 text-xs font-medium text-foreground">Pedidos activos</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-background p-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Icon name="clock" className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Cappuccino · María R.</p>
                    <p className="text-[0.65rem] text-muted-foreground">Recibido hace 2 min</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6rem] font-medium text-amber-700">Preparando</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background p-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <Icon name="check" className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Latte Vainilla · Juan P.</p>
                    <p className="text-[0.65rem] text-muted-foreground">Recibido hace 5 min</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[0.6rem] font-medium text-green-700">Listo</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-background p-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Icon name="receipt" className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Americano · Ana L.</p>
                    <p className="text-[0.65rem] text-muted-foreground">Recibido hace 8 min</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[0.6rem] font-medium text-blue-700">Recibido</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <p className="mb-2 text-xs font-medium text-foreground">Horas pico</p>
            <div className="flex items-end gap-2">
              <div className="w-4 rounded-sm bg-border" style={{ height: '2.5rem' }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: '3.5rem' }} />
              <div className="w-4 rounded-sm bg-accent" style={{ height: '5rem' }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: '4rem' }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: '3rem' }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: '2rem' }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: '1.5rem' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  description,
  fee,
  volume,
  highlighted,
}: {
  name: string;
  description: string;
  fee: string;
  volume: string;
  highlighted?: boolean;
}) {
  return (
    <Card
      className={`relative p-6 transition-shadow hover:shadow-md ${
        highlighted
          ? "border-accent bg-accent/5 ring-1 ring-accent"
          : "border-border"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground">
          Más popular
        </span>
      )}
      <h3 className="font-sans text-lg font-semibold text-foreground">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">
        <span className="text-3xl font-bold text-foreground">{fee}</span>
        <span className="text-muted-foreground"> / por pedido</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{volume}</p>
      <Button asChild className="mt-6 w-full" variant={highlighted ? "primary" : "outline"}>
        <Link href="/auth/signup">Elegir plan</Link>
      </Button>
    </Card>
  );
}
