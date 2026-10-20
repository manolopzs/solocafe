import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { MobileNav } from "@/components/landing/mobile-nav";
import { env } from "@/lib/env";

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

const shots = [
  {
    src: "/product/pedido.jpg",
    alt: "Pantalla de pedido del cliente en el celular",
    title: "Pedido",
    text: "El cliente elige, paga y recoge.",
  },
  {
    src: "/product/cocina.jpg",
    alt: "Pantalla de cocina con pedidos en curso",
    title: "Cocina",
    text: "La barra ve cada pedido pagado.",
  },
  {
    src: "/product/panel.jpg",
    alt: "Panel de la cafetería con el resumen del día",
    title: "Panel",
    text: "Ventas, menú y código QR en un lugar.",
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

      <section className="bg-background px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground shadow-xs">
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
            <Button asChild variant="outline" size="lg" className="w-full bg-surface-elevated sm:w-auto">
              <Link href="/demo">Ver demo</Link>
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
              Capturas del producto en marcha: el pedido del cliente, la cocina y el panel de la cafetería.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {shots.map((shot) => (
              <figure key={shot.src} className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
                <div className="relative h-96 bg-surface">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-contain"
                  />
                </div>
                <figcaption className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">{shot.title}</p>
                  <p className="mt-1 text-sm text-foreground">{shot.text}</p>
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
            <Image
              src="/product/pedido.jpg"
              alt="Pedido de un cliente en la página de la cafetería"
              width={390}
              height={844}
              className="h-auto w-full max-w-sm rounded-[2rem] border border-border shadow-lg"
            />
          </div>
        </div>
      </section>

      <section id="cafeterias" className="bg-surface px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <Image
              src="/product/panel.jpg"
              alt="Resumen del día en el panel de la cafetería"
              width={1100}
              height={760}
              className="h-auto w-full rounded-2xl border border-border shadow-lg"
            />
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

      <section id="precios" className="bg-background px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Precios
            </h2>
            <p className="mt-4 text-muted-foreground">
              Lo que publica la API. Sin cifras añadidas en esta página.
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

function PricingSection({ pricing }: { pricing: PublicPricing | null }) {
  if (!pricing || pricing.tiers.length === 0) {
    return (
      <Card className="mx-auto mt-14 max-w-2xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Marcador</p>
        <h3 className="mt-3 font-sans text-2xl font-semibold text-foreground">Precios por publicar</h3>
        <p className="mt-3 text-muted-foreground">
          Marcador de precios. La API no devolvió planes activos, así que esta sección no muestra cifras.
        </p>
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
              {formatCents(tier.monthly_price_cents)}
              <span className="text-base font-medium text-muted-foreground"> al mes</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              <li>{tier.included_orders} pedidos incluidos</li>
              <li>{formatCents(tier.overage_per_order_cents)} por pedido extra</li>
            </ul>
            <Button asChild className="mt-6 w-full">
              <Link href="/auth/signup">Empezar gratis</Link>
            </Button>
          </Card>
        ))}
      </div>
      {Number.isFinite(pricing.platform_fee_percent) && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Comisión de plataforma: {String(pricing.platform_fee_percent)}%. Los montos del plan salen de centavos guardados en la API y no traen moneda.
        </p>
      )}
    </>
  );
}

function formatCents(cents: number) {
  return (cents / 100).toFixed(2);
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
