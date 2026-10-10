import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

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
            <Link href="#cafeterias" className="hover:text-foreground">Cafeterías</Link>
            <Link href="#clientes" className="hover:text-foreground">Clientes</Link>
            <Link href="#precios" className="hover:text-foreground">Precios</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup">Empezar gratis</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[#f0f4f8] px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground shadow-xs">
            <Icon name="star" className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>4.9 promedio basado en 100+ opiniones</span>
          </div>
          <h1 className="mx-auto max-w-4xl font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-6xl sm:leading-[1.1]">
            Hacemos que vender café en línea sea simple, directo y rentable
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Únete a cientos de cafeterías independientes que reciben pedidos, cobran directo y organizan su cocina sin pagar comisiones de marketplace.
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
              Tu cafetería, Solo Cafe y tus clientes conectados
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Solo Cafe se coloca en el centro: recibes pedidos, organizas la cocina y tus clientes pagan sin intermediarios.
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
              Ordena tu café favorito sin esperar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tus clientes escanean el QR, eligen su bebida, personalizan su orden y pagan en segundos. Sin apps, sin registros obligatorios, sin filas.
            </p>
            <ul className="mt-8 space-y-4">
              <BenefitItem text="Ve el menú completo con fotos y precios" />
              <BenefitItem text="Personaliza tu orden con modificadores" />
              <BenefitItem text="Programa tu recogida y evita filas" />
              <BenefitItem text="Recibe una notificación cuando tu pedido está listo" />
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
              Vende más, administra menos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Olvídate de pedidos desorganizados por WhatsApp y de regalar el 30% a los marketplaces. Con Solo Cafe el dinero va directo a tu cuenta.
            </p>
            <ul className="mt-8 space-y-4">
              <BenefitItem text="Recibe pedidos organizados en tu cocina" />
              <BenefitItem text="Cobra directo en tu cuenta con Stripe" />
              <BenefitItem text="Controla tu menú y disponibilidad en tiempo real" />
              <BenefitItem text="Gestiona horarios y capacidad por slot" />
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
              Un precio que crece contigo
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sin renta mensual. Pagas una comisión pequeña solo cuando vendes.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <PricingCard
              name="Inicio"
              description="Para cafeterías que empiezan"
              fee="0%"
              volume="Hasta $20,000 MXN"
            />
            <PricingCard
              name="Crecimiento"
              description="Para cafeterías con ritmo"
              fee="2.5%"
              volume="$20,000 - $100,000 MXN"
              highlighted
            />
            <PricingCard
              name="Escala"
              description="Para múltiples ubicaciones"
              fee="1.5%"
              volume="Más de $100,000 MXN"
            />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Comisión de plataforma. No incluye costos de procesamiento de Stripe. Sin contrato.
          </p>
        </div>
      </section>

      <section className="bg-primary px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Deja de regalar tu margen hoy
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/70">
            Crea tu cuenta gratis y empieza a recibir pedidos en menos de 30 minutos.
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
            Hecho para cafeterías independientes.
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
            <div className="h-1.5 w-6 rounded bg-border" />
            <div className="mt-1.5 h-3 w-8 rounded bg-border" />
          </div>
          <div className="rounded-lg bg-surface p-2">
            <div className="h-1.5 w-6 rounded bg-border" />
            <div className="mt-1.5 h-3 w-8 rounded bg-border" />
          </div>
          <div className="rounded-lg bg-surface p-2">
            <div className="h-1.5 w-6 rounded bg-border" />
            <div className="mt-1.5 h-3 w-8 rounded bg-border" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-surface p-2">
            <div className="h-2 w-16 rounded bg-border" />
            <div className="h-2 w-8 rounded bg-border" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface p-2">
            <div className="h-2 w-20 rounded bg-border" />
            <div className="h-2 w-8 rounded bg-border" />
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
        <div className="mb-2 h-16 rounded-lg bg-surface" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-surface p-1.5">
            <div className="h-8 w-8 rounded-lg bg-accent/10" />
            <div className="flex-1">
              <div className="h-2 w-full rounded bg-border" />
              <div className="mt-1 h-1.5 w-12 rounded bg-border" />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface p-1.5">
            <div className="h-8 w-8 rounded-lg bg-accent/10" />
            <div className="flex-1">
              <div className="h-2 w-full rounded bg-border" />
              <div className="mt-1 h-1.5 w-14 rounded bg-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockupLarge() {
  return (
    <div className="w-full max-w-[16rem] overflow-hidden rounded-[2rem] border-[6px] border-border bg-background shadow-2xl">
      <div className="flex items-center justify-center bg-surface py-2">
        <div className="h-1 w-14 rounded-full bg-border" />
      </div>
      <div className="p-4">
        <div className="mb-4 h-28 rounded-xl bg-surface" />
        <div className="mb-3 h-3 w-24 rounded bg-border" />
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="h-12 w-12 rounded-xl bg-accent/10" />
            <div className="flex-1">
              <div className="h-2.5 w-full rounded bg-border" />
              <div className="mt-2 h-2 w-20 rounded bg-border" />
            </div>
            <div className="h-2.5 w-10 rounded bg-border" />
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="h-12 w-12 rounded-xl bg-accent/10" />
            <div className="flex-1">
              <div className="h-2.5 w-full rounded bg-border" />
              <div className="mt-2 h-2 w-24 rounded bg-border" />
            </div>
            <div className="h-2.5 w-10 rounded bg-border" />
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground">
          Ordenar $85.00
        </div>
      </div>
    </div>
  );
}

function DashboardMockupLarge() {
  return (
    <div className="w-full max-w-[28rem] overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-3 h-4 flex-1 rounded bg-border" />
      </div>
      <div className="flex">
        <div className="w-14 border-r border-border bg-surface py-4">
          <div className="mx-auto mb-3 h-5 w-5 rounded bg-border" />
          <div className="mx-auto mb-3 h-5 w-5 rounded bg-border" />
          <div className="mx-auto h-5 w-5 rounded bg-border" />
        </div>
        <div className="flex-1 p-4">
          <div className="mb-4 h-4 w-28 rounded bg-border" />
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-surface p-3">
              <div className="h-2 w-10 rounded bg-border" />
              <div className="mt-2 h-6 w-14 rounded bg-border" />
            </div>
            <div className="rounded-lg bg-surface p-3">
              <div className="h-2 w-10 rounded bg-border" />
              <div className="mt-2 h-6 w-14 rounded bg-border" />
            </div>
            <div className="rounded-lg bg-surface p-3">
              <div className="h-2 w-10 rounded bg-border" />
              <div className="mt-2 h-6 w-14 rounded bg-border" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-surface p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent/10" />
                <div>
                  <div className="h-2.5 w-24 rounded bg-border" />
                  <div className="mt-1.5 h-2 w-16 rounded bg-border" />
                </div>
              </div>
              <div className="h-2 w-12 rounded bg-border" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent/10" />
                <div>
                  <div className="h-2.5 w-28 rounded bg-border" />
                  <div className="mt-1.5 h-2 w-20 rounded bg-border" />
                </div>
              </div>
              <div className="h-2 w-12 rounded bg-border" />
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
