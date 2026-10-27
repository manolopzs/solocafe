import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { MobileNav } from "@/components/landing/mobile-nav";
import { env } from "@/lib/env";
import { formatMoney } from "@/lib/ordering";

type PricingTier = {
  name: string;
  monthly_price_cents: number;
  included_orders: number;
  overage_per_order_cents: number;
};

type PublicPricing = {
  platform_fee_percent: number;
  tiers: PricingTier[];
};

const frames = [
  {
    title: "Pedido",
    text: "El cliente elige, paga y recoge.",
    mockup: <PhoneMockup />,
  },
  {
    title: "Cocina",
    text: "La barra ve cada pedido pagado.",
    mockup: <KitchenMockup />,
  },
  {
    title: "Panel",
    text: "Ventas, menú y código QR en un lugar.",
    mockup: <DashboardMockup />,
  },
];

export default async function Home() {
  const pricing = await loadPublicPricing();

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
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex">
            <Link href="#plataforma" className="hover:text-foreground">Plataforma</Link>
            <Link href="#clientes" className="hover:text-foreground">Clientes</Link>
            <Link href="#cafeterias" className="hover:text-foreground">Cafeterías</Link>
            <Link href="#precios" className="hover:text-foreground">Precios</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden whitespace-nowrap md:inline-flex">
              <Link href="/auth/login">Soy cafetería</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden whitespace-nowrap md:inline-flex">
              <Link href="/account/login">Soy cliente</Link>
            </Button>
            <Button asChild size="sm" className="whitespace-nowrap">
              <Link href="/auth/signup">Empezar gratis</Link>
            </Button>
            <MobileNav />
          </div>
        </div>
      </nav>

      <section className="bg-background px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 flex w-fit max-w-full items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground shadow-xs">
            <Icon name="coffee" className="h-4 w-4 shrink-0 text-accent" />
            <span className="min-w-0 text-balance">Pedidos pagados por adelantado para tu cafetería</span>
          </div>
          <h1 className="mx-auto max-w-4xl font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-6xl sm:leading-[1.1]">
            Tu cafetería, con el pedido ya pagado
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Tus clientes ordenan y pagan desde el móvil. Tú preparas el pedido y lo entregas sin fila. El cobro entra en tu cuenta.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/signup">Empieza gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full bg-surface-elevated sm:w-auto">
              <Link href="/demo">Ver demo</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
              <Link href="/explore">Explorar cafeterías</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="plataforma" className="bg-surface px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Pedidos, cocina y pago en un solo flujo
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Solo Cafe conecta a tus clientes con tu cafetería: ordenan por adelantado, tú recibes el pedido en la cocina y el pago va directo a tu cuenta.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {frames.map((frame) => (
              <figure key={frame.title} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
                <div className="flex flex-1 items-center justify-center bg-surface p-5">
                  {frame.mockup}
                </div>
                <figcaption className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">{frame.title}</p>
                  <p className="mt-1 text-sm text-foreground">{frame.text}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo</p>
                </figcaption>
              </figure>
            ))}
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

      <section id="cafeterias" className="bg-surface px-6 py-20 sm:py-28">
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
              <BenefitItem text="Previsión de pedidos, productos y horas de más demanda" />
            </ul>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/auth/signup">Abrir mi cafetería gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="precios" className="bg-background px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Precios
            </h2>
            <p className="mt-4 text-muted-foreground">
              Precios en euros para tu cafetería. Durante el piloto no hay cuota ni comisión.
            </p>
          </div>
          <PricingSection pricing={pricing} />
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
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Pedidos pagados por adelantado para tu cafetería.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground">Soy cafetería</Link>
            <Link href="/account/login" className="hover:text-foreground">Soy cliente</Link>
            <Link href="/auth/signup" className="hover:text-foreground">Crear cuenta</Link>
            <Link href="/demo" className="hover:text-foreground">Demo</Link>
          </div>
        </div>
        <nav aria-label="Información legal" className="mx-auto mt-8 flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/aviso-legal" className="hover:text-foreground">Aviso legal</Link>
          <Link href="/privacidad" className="hover:text-foreground">Privacidad</Link>
          <Link href="/terminos" className="hover:text-foreground">Términos</Link>
          <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link href="/contacto" className="hover:text-foreground">Contacto</Link>
        </nav>
      </footer>
    </main>
  );
}

async function loadPublicPricing(): Promise<PublicPricing | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/public/pricing`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as Partial<PublicPricing>;
    if (!Array.isArray(data.tiers)) return null;

    return {
      platform_fee_percent: typeof data.platform_fee_percent === "number" ? data.platform_fee_percent : Number.NaN,
      tiers: data.tiers.filter(isPricingTier),
    };
  } catch {
    return null;
  }
}

function isPricingTier(value: unknown): value is PricingTier {
  if (!value || typeof value !== "object") return false;
  const tier = value as Partial<PricingTier>;
  return (
    typeof tier.name === "string" &&
    typeof tier.monthly_price_cents === "number" &&
    typeof tier.included_orders === "number" &&
    typeof tier.overage_per_order_cents === "number"
  );
}

function hasCommercialPrice(pricing: PublicPricing | null): pricing is PublicPricing {
  if (!pricing || pricing.tiers.length === 0) return false;
  if (Number.isFinite(pricing.platform_fee_percent) && pricing.platform_fee_percent > 0) return true;
  return pricing.tiers.some((tier) => tier.monthly_price_cents > 0 || tier.overage_per_order_cents > 0);
}

function PricingSection({ pricing }: { pricing: PublicPricing | null }) {
  if (!hasCommercialPrice(pricing)) {
    return (
      <Card className="mx-auto mt-14 max-w-xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Modelo en euros</p>
        <h3 className="mt-3 font-sans text-3xl font-semibold text-foreground">Gratis durante el piloto</h3>
        <ul className="mt-6 space-y-2 text-sm text-foreground">
          <li>Cuota mensual: {formatMoney(0)}</li>
          <li>Comisión por pedido: {formatMoney(0)}</li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          El piloto en el campus IE no tiene coste. Cuando fijemos la tarifa, la verás aquí en euros antes de que se aplique.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/signup">Empezar gratis</Link>
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className={`mt-14 grid gap-6 ${pricing.tiers.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-md"}`}>
        {pricing.tiers.map((tier) => (
          <Card key={tier.name} className="p-6">
            <h3 className="font-sans text-lg font-semibold text-foreground">{tier.name}</h3>
            <p className="mt-4 text-3xl font-bold text-foreground">
              {formatMoney(tier.monthly_price_cents)}
              <span className="text-base font-medium text-muted-foreground"> al mes</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              <li>{tier.included_orders} pedidos incluidos</li>
              <li>{formatMoney(tier.overage_per_order_cents)} por pedido extra</li>
            </ul>
            <Button asChild className="mt-6 w-full">
              <Link href="/auth/signup">Empezar gratis</Link>
            </Button>
          </Card>
        ))}
      </div>
      {Number.isFinite(pricing.platform_fee_percent) && pricing.platform_fee_percent > 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Comisión de plataforma: {String(pricing.platform_fee_percent)}% por pedido, en euros.
        </p>
      )}
    </>
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
        <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-wider text-accent">Demo</p>
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-surface p-2">
            <p className="text-[0.6rem] text-muted-foreground">Ventas</p>
            <p className="text-sm font-semibold text-foreground">{formatMoney(18640)}</p>
          </div>
          <div className="rounded-lg bg-surface p-2">
            <p className="text-[0.6rem] text-muted-foreground">Pedidos</p>
            <p className="text-sm font-semibold text-foreground">86</p>
          </div>
          <div className="rounded-lg bg-surface p-2">
            <p className="text-[0.6rem] text-muted-foreground">Ticket</p>
            <p className="text-sm font-semibold text-foreground">{formatMoney(490)}</p>
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
          <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-accent">Demo</p>
          <p className="text-[0.6rem] text-muted-foreground">Bienvenido a</p>
          <p className="text-xs font-semibold text-foreground">Café Recoletos</p>
          <p className="text-[0.6rem] text-muted-foreground">Madrid</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-surface p-1.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-700 to-amber-500" />
            <div className="flex-1">
              <p className="text-[0.65rem] font-medium text-foreground">Cappuccino</p>
              <p className="text-[0.6rem] text-muted-foreground">{formatMoney(280)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface p-1.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-stone-600 to-stone-400" />
            <div className="flex-1">
              <p className="text-[0.65rem] font-medium text-foreground">Latte vainilla</p>
              <p className="text-[0.6rem] text-muted-foreground">{formatMoney(320)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KitchenMockup() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-red-400" />
        <div className="h-2 w-2 rounded-full bg-amber-400" />
        <div className="h-2 w-2 rounded-full bg-green-400" />
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        <KitchenColumn label="Recibido" item="Americano" who="Ana" pill="bg-blue-100 text-blue-700" />
        <KitchenColumn label="Preparando" item="Cappuccino" who="María" pill="bg-amber-100 text-amber-700" />
        <KitchenColumn label="Listo" item="Latte" who="Juan" pill="bg-green-100 text-green-700" />
      </div>
    </div>
  );
}

function KitchenColumn({
  label,
  item,
  who,
  pill,
}: {
  label: string;
  item: string;
  who: string;
  pill: string;
}) {
  return (
    <div className="rounded-lg bg-surface p-2">
      <p className={`inline-flex rounded-full px-1.5 py-0.5 text-[0.55rem] font-medium ${pill}`}>{label}</p>
      <p className="mt-2 text-[0.65rem] font-medium text-foreground">{item}</p>
      <p className="text-[0.6rem] text-muted-foreground">{who}</p>
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
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Demo</p>
            <p className="text-xs text-muted-foreground">Bienvenido a</p>
            <h3 className="font-sans text-base font-semibold text-foreground">Café Recoletos</h3>
            <p className="text-xs text-muted-foreground">Madrid</p>
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
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Cappuccino</p>
              <p className="truncate text-xs text-muted-foreground">Espresso doble con leche vaporizada</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{formatMoney(280)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-stone-700 via-stone-500 to-stone-300" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Latte vainilla</p>
              <p className="truncate text-xs text-muted-foreground">Café suave con un toque de vainilla</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{formatMoney(320)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-orange-900 via-amber-800 to-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Americano</p>
              <p className="truncate text-xs text-muted-foreground">Espresso con agua caliente</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{formatMoney(220)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="rounded-xl bg-foreground py-3 text-center text-sm font-semibold text-primary-foreground">
          Ver pedido · {formatMoney(0)}
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
          <div className="mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded bg-border text-muted-foreground">
            <Icon name="store" className="h-3.5 w-3.5" />
          </div>
          <div className="mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded bg-border text-muted-foreground">
            <Icon name="receipt" className="h-3.5 w-3.5" />
          </div>
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded bg-border text-muted-foreground">
            <Icon name="settings" className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-sans text-base font-semibold text-foreground">Panel de control</h3>
            <div className="h-7 w-7 rounded-full bg-border" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">Demo</p>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-surface p-3">
              <p className="text-xs text-muted-foreground">Ventas hoy</p>
              <p className="mt-1 font-sans text-lg font-semibold text-foreground">{formatMoney(18640)}</p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <p className="text-xs text-muted-foreground">Pedidos</p>
              <p className="mt-1 font-sans text-lg font-semibold text-foreground">86</p>
            </div>
            <div className="rounded-lg bg-surface p-3">
              <p className="text-xs text-muted-foreground">Ticket medio</p>
              <p className="mt-1 font-sans text-lg font-semibold text-foreground">{formatMoney(490)}</p>
            </div>
          </div>
          <div className="mb-4 rounded-lg bg-surface p-3">
            <p className="mb-2 text-xs font-medium text-foreground">Pedidos activos</p>
            <div className="space-y-2">
              <DashboardOrder
                icon="clock"
                iconClass="bg-amber-100 text-amber-700"
                title="Cappuccino · María R."
                detail="Recibido hace 2 min"
                pill="bg-amber-100 text-amber-700"
                status="Preparando"
              />
              <DashboardOrder
                icon="check"
                iconClass="bg-green-100 text-green-700"
                title="Latte Vainilla · Juan P."
                detail="Recibido hace 5 min"
                pill="bg-green-100 text-green-700"
                status="Listo"
              />
              <DashboardOrder
                icon="receipt"
                iconClass="bg-blue-100 text-blue-700"
                title="Americano · Ana L."
                detail="Recibido hace 8 min"
                pill="bg-blue-100 text-blue-700"
                status="Recibido"
              />
            </div>
          </div>
          <div className="rounded-lg bg-surface p-3">
            <p className="mb-2 text-xs font-medium text-foreground">Horas pico</p>
            <div className="flex items-end gap-2">
              <div className="w-4 rounded-sm bg-border" style={{ height: "2.5rem" }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: "3.5rem" }} />
              <div className="w-4 rounded-sm bg-accent" style={{ height: "5rem" }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: "4rem" }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: "3rem" }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: "2rem" }} />
              <div className="w-4 rounded-sm bg-border" style={{ height: "1.5rem" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardOrder({
  icon,
  iconClass,
  title,
  detail,
  pill,
  status,
}: {
  icon: IconName;
  iconClass: string;
  title: string;
  detail: string;
  pill: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-background p-2">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconClass}`}>
          <Icon name={icon} className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <p className="text-[0.65rem] text-muted-foreground">{detail}</p>
        </div>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${pill}`}>{status}</span>
    </div>
  );
}
