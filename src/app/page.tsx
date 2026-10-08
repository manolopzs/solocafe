import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <nav className="sticky top-0 z-50 border-b border-warm-200 bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-espresso-700 text-white shadow-sm">
              <Icon name="coffee" className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Solo Cafe
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-amber-100/40 to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-warm-200 bg-paper px-4 py-1.5 text-sm text-muted-foreground shadow-xs">
            <span className="inline-flex h-2 w-2 rounded-full bg-success" />
            Plataforma en vivo para cafeterias independientes
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Pedidos para recoger, hechos simples
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Tu propia pagina de pedidos, tu menu, tus pagos y tu cocina organizada. Sin comisiones abusivas, sin apps de terceros.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/signup">Empieza gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/auth/login">Ver demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Configura tu cafeteria en menos de 30 minutos.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Icon name="store" className="h-6 w-6" />}
            title="Tu marca, tu pagina"
            description="Cada cafeteria tiene su propia pagina de pedidos con su nombre, horarios y ubicacion. Compartela por QR o redes."
          />
          <FeatureCard
            icon={<Icon name="receipt" className="h-6 w-6" />}
            title="Menu en minutos"
            description="Crea categorias, productos y modificadores. Activa o desactiva items en tiempo real cuando se acaben."
          />
          <FeatureCard
            icon={<Icon name="credit-card" className="h-6 w-6" />}
            title="Pagos directos"
            description="Conecta Stripe y recibe los pagos directamente en tu cuenta. La plataforma cobra una comision pequena segun tu volumen."
          />
          <FeatureCard
            icon={<Icon name="utensils" className="h-6 w-6" />}
            title="Cocina organizada"
            description="Una pantalla de cocina clara para tablet. Recibido, preparando, listo, entregado. Sin pedidos perdidos."
          />
          <FeatureCard
            icon={<Icon name="clock" className="h-6 w-6" />}
            title="Horarios sin saturacion"
            description="Tus clientes eligen ASAP o un horario de recogida. Limites de capacidad para que la barra nunca se sienta abrumada."
          />
          <FeatureCard
            icon={<Icon name="qrcode" className="h-6 w-6" />}
            title="QR listo para usar"
            description="Genera un codigo QR unico para tu cafeteria. Colocalo en mesas, ventanas o Instagram."
          />
        </div>
      </section>

      <section className="bg-warm-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Crecemos contigo
            </h2>
            <p className="mt-4 text-muted-foreground">
              Empezamos como software para tu cafeteria. Luego conectamos a los clientes con todas las cafeterias de la red.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <StageCard
              number="1"
              title="Software"
              description="Pagina de pedidos, pagos, menu y cocina bajo tu marca. Empieza a vender hoy."
              current
            />
            <StageCard
              number="2"
              title="Red"
              description="Los clientes descubren tu cafeteria en una app compartida. Pedidos para recoger desde cualquier lado."
            />
            <StageCard
              number="3"
              title="Marketplace"
              description="Lealtad cruzada, promociones y descubrimiento. La red impulsa tu volumen sin quitarte tu marca."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Precio justo por volumen
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sin costos ocultos. Solo pagas una comision pequena segun cuanto vendes.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <PricingCard
              name="Inicio"
              description="Para cafeterias que empiezan"
              fee="0%"
              volume="Hasta $20,000 MXN/mes"
            />
            <PricingCard
              name="Crecimiento"
              description="Para cafeterias con ritmo"
              fee="2.5%"
              volume="$20,000 - $100,000 MXN/mes"
              highlighted
            />
            <PricingCard
              name="Escala"
              description="Para multiples ubicaciones"
              fee="1.5%"
              volume="Mas de $100,000 MXN/mes"
            />
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Comision de la plataforma, sin incluir costos de Stripe. Hablamos para ajustar tu plan.
          </p>
        </div>
      </section>

      <section className="bg-espresso-900 px-6 py-16 text-espresso-50">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Lista tu cafeteria hoy
          </h2>
          <p className="mt-4 text-espresso-200">
            Crea tu cuenta, configura tu menu y comparte tu QR. En 30 minutos recibes tu primer pedido.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/auth/signup">Crear cuenta gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full border-espresso-700 bg-transparent text-white hover:bg-espresso-800 sm:w-auto">
              <Link href="/auth/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-warm-200 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-espresso-700 text-white">
              <Icon name="coffee" className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">Solo Cafe</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Hecho para cafeterias independientes.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card variant="outline" className="p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-warm-100 text-espresso-700">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </Card>
  );
}

function StageCard({
  number,
  title,
  description,
  current,
}: {
  number: string;
  title: string;
  description: string;
  current?: boolean;
}) {
  return (
    <Card variant={current ? "default" : "outline"} className={`relative p-6 ${current ? "ring-1 ring-amber-400" : ""}`}>
      {current && (
        <span className="absolute -top-3 right-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-medium text-amber-900">
          Ahora
        </span>
      )}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-espresso-700 text-sm font-bold text-white">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </Card>
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
      variant="outline"
      className={`relative p-6 ${highlighted ? "border-amber-400 bg-amber-50/50 ring-1 ring-amber-400" : ""}`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-0.5 text-xs font-medium text-amber-900">
          Mas popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
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
