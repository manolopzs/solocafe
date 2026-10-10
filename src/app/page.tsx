import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
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
            <Link href="#funciones" className="hover:text-foreground">Funciones</Link>
            <Link href="#como-funciona" className="hover:text-foreground">Cómo funciona</Link>
            <Link href="#precios" className="hover:text-foreground">Precios</Link>
            <Link href="#preguntas" className="hover:text-foreground">Preguntas</Link>
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

      <section className="relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <Badge variant="outline" className="mb-6 gap-2 px-4 py-1.5 text-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-success" />
            Sistema de pedidos para recoger · Sin comisiones de marketplace
          </Badge>
          <h1 className="mx-auto max-w-4xl font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-6xl sm:leading-[1.1]">
            Deja de regalar el 30% de cada venta a los marketplaces. Vende directo a tus clientes.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Crea tu menú digital con tu marca, recibe pagos directo en tu cuenta y organiza la cocina desde una tablet. Lista para vender en 30 minutos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/signup">Empieza gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/demo">Ver demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Tu cafetería, tu sistema y tus clientes conectados
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Solo Cafe se coloca en el centro: recibes pedidos, organizas la cocina y tus clientes pagan sin intermediarios.
            </p>
          </div>

          <div className="relative hidden items-center justify-between gap-2 lg:flex">
            <div className="flex flex-1 flex-col items-center">
              <DashboardMockup />
              <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">La cafetería</p>
            </div>

            <ConnectionLine />

            <div className="flex flex-col items-center">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Icon name="coffee" className="h-14 w-14" />
              </div>
              <h3 className="mt-5 font-sans text-lg font-semibold text-foreground">Solo Cafe</h3>
              <p className="mt-1 text-sm text-muted-foreground">Plataforma de pedidos</p>
            </div>

            <ConnectionLine />

            <div className="flex flex-1 flex-col items-center">
              <PhoneMockup />
              <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">Los clientes</p>
            </div>
          </div>

          <div className="grid gap-8 lg:hidden">
            <div className="flex flex-col items-center">
              <DashboardMockup />
              <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">La cafetería</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Icon name="coffee" className="h-10 w-10" />
              </div>
              <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">Solo Cafe</h3>
            </div>
            <div className="flex flex-col items-center">
              <PhoneMockup />
              <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">Los clientes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Vender café en línea no debería costarte la mitad de tu margen
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Los marketplaces te cobran hasta el 30%, te ocultan quién es tu cliente y te exponen a la competencia. Con Solo Cafe vendes directo: tu menú, tu marca, tu dinero.
          </p>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-border bg-surface px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              En tres pasos empiezas a vender
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sin integraciones complejas ni configuraciones técnicas.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Crea tu cafetería"
              description="Regístrate, elige tu URL y configura tu moneda. Sin contratos ni tarjeta."
            />
            <StepCard
              number="2"
              title="Sube tu menú"
              description="Agrega productos, modificadores y fotos. Previsualiza cómo lo ve el cliente."
            />
            <StepCard
              number="3"
              title="Comparte tu QR"
              description="Imprímelo o envía el enlace. Los clientes pagan y tú recibes el pedido en la cocina."
            />
          </div>
        </div>
      </section>

      <section id="funciones" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Todo lo que necesitas para vender en línea
            </h2>
            <p className="mt-4 text-muted-foreground">
              Deja de perder margen con marketplaces. Con Solo Cafe controlas la experiencia, los datos y los pagos.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Icon name="store" className="h-6 w-6" />}
              title="Tu propia página de pedidos"
              description="Una página con la identidad de tu cafetería. Compártela por QR, redes o WhatsApp. Los clientes compran sin instalar nada."
            />
            <FeatureCard
              icon={<Icon name="receipt" className="h-6 w-6" />}
              title="Menú que administras en minutos"
              description="Categorías, productos, modificadores y fotos. Activa o desactiva items en tiempo real desde tu teléfono."
            />
            <FeatureCard
              icon={<Icon name="credit-card" className="h-6 w-6" />}
              title="Pagos directos a tu cuenta"
              description="Conecta Stripe Connect y recibe el dinero directamente. Tú decides cuándo y cómo cobrar."
            />
            <FeatureCard
              icon={<Icon name="utensils" className="h-6 w-6" />}
              title="Cocina organizada en tiempo real"
              description="Visualiza pedidos en una tablet, actualiza estados y avisa a los clientes cuando su orden está lista."
            />
            <FeatureCard
              icon={<Icon name="clock" className="h-6 w-6" />}
              title="Horarios sin saturación"
              description="Tus clientes eligen lo antes posible o un horario de recogida. Límites de capacidad para que la barra no se colapse."
            />
            <FeatureCard
              icon={<Icon name="qrcode" className="h-6 w-6" />}
              title="QR listo para imprimir"
              description="Genera un código QR único para tu cafetería. Colócalo en mesas, ventanas o en la entrada."
            />
          </div>
        </div>
      </section>

      <section id="precios" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Precio que crece contigo
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sin suscripción mensual. Solo pagas una comisión pequeña según cuánto vendes.
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
            Comisión de plataforma. No incluye costos de Stripe. Sin contrato, cancelas cuando quieras.
          </p>
        </div>
      </section>

      <section id="preguntas" className="border-y border-border bg-surface px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            <FaqItem
              question="¿Necesito tarjeta de crédito para empezar?"
              answer="No. Puedes crear tu cuenta y configurar tu menú gratis. Solo conectas Stripe cuando quieras recibir pagos."
            />
            <FaqItem
              question="¿Cuánto tarda en estar lista mi página?"
              answer="La mayoría de las cafeterías están vendiendo en menos de 30 minutos: crear cuenta, subir el menú y compartir el QR."
            />
            <FaqItem
              question="¿Puedo cobrar en efectivo?"
              answer="Sí. Aunque la plataforma está optimizada para pagos con tarjeta, puedes registrar pedidos pagados en efectivo desde el dashboard."
            />
            <FaqItem
              question="¿Qué pasa si se me acaba un producto?"
              answer="Desde tu teléfono o tablet puedes marcar cualquier producto como agotado en segundos. Desaparece de la página del cliente automáticamente."
            />
          </div>
        </div>
      </section>

      <section className="bg-foreground px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Abre tu canal de ventas directo hoy
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            Crea tu cuenta, configura tu menú y comparte tu QR. En 30 minutos recibes tu primer pedido.
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

      <footer className="border-t border-border px-6 py-12">
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

function ConnectionLine() {
  return (
    <div className="flex flex-1 items-center px-4">
      <div className="relative flex flex-1 items-center">
        <div className="flex-1 border-t-2 border-dashed border-border" />
        <div className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-border bg-background" />
        <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-border bg-background" />
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full max-w-[20rem] overflow-hidden rounded-xl border border-border bg-background shadow-md">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-3 h-4 flex-1 rounded bg-border" />
      </div>
      <div className="flex">
        <div className="w-12 border-r border-border bg-surface py-4">
          <div className="mx-auto mb-3 h-5 w-5 rounded bg-border" />
          <div className="mx-auto mb-3 h-5 w-5 rounded bg-border" />
          <div className="mx-auto h-5 w-5 rounded bg-border" />
        </div>
        <div className="flex-1 p-4">
          <div className="mb-4 h-4 w-24 rounded bg-border" />
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-surface p-2">
              <div className="h-2 w-8 rounded bg-border" />
              <div className="mt-2 h-5 w-12 rounded bg-border" />
            </div>
            <div className="rounded-lg bg-surface p-2">
              <div className="h-2 w-8 rounded bg-border" />
              <div className="mt-2 h-5 w-12 rounded bg-border" />
            </div>
            <div className="rounded-lg bg-surface p-2">
              <div className="h-2 w-8 rounded bg-border" />
              <div className="mt-2 h-5 w-12 rounded bg-border" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-surface p-2.5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent/10" />
                <div>
                  <div className="h-2.5 w-20 rounded bg-border" />
                  <div className="mt-1.5 h-2 w-14 rounded bg-border" />
                </div>
              </div>
              <div className="h-2 w-10 rounded bg-border" />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface p-2.5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent/10" />
                <div>
                  <div className="h-2.5 w-24 rounded bg-border" />
                  <div className="mt-1.5 h-2 w-16 rounded bg-border" />
                </div>
              </div>
              <div className="h-2 w-10 rounded bg-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="w-full max-w-[12rem] overflow-hidden rounded-[1.75rem] border-[6px] border-border bg-background shadow-xl">
      <div className="flex items-center justify-center bg-surface py-2">
        <div className="h-1 w-12 rounded-full bg-border" />
      </div>
      <div className="p-3">
        <div className="mb-3 h-24 rounded-xl bg-surface" />
        <div className="mb-2 flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-border" />
          <div className="h-3 w-10 rounded bg-border" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-surface p-2">
            <div className="h-10 w-10 rounded-lg bg-accent/10" />
            <div className="flex-1">
              <div className="h-2.5 w-full rounded bg-border" />
              <div className="mt-1.5 h-2 w-16 rounded bg-border" />
            </div>
            <div className="h-2.5 w-10 rounded bg-border" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface p-2">
            <div className="h-10 w-10 rounded-lg bg-accent/10" />
            <div className="flex-1">
              <div className="h-2.5 w-full rounded bg-border" />
              <div className="mt-1.5 h-2 w-20 rounded bg-border" />
            </div>
            <div className="h-2.5 w-10 rounded bg-border" />
          </div>
        </div>
      </div>
      <div className="p-3 pt-0">
        <div className="rounded-lg bg-primary py-2 text-center text-xs font-semibold text-primary-foreground">
          Ordenar
        </div>
      </div>
    </div>
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
    <Card className="p-6 transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </Card>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="relative p-8">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="font-sans text-xl font-semibold text-foreground">{title}</h3>
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card className="p-6">
      <h3 className="font-sans text-lg font-semibold text-foreground">{question}</h3>
      <p className="mt-2 text-muted-foreground">{answer}</p>
    </Card>
  );
}
