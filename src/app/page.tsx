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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-sm">
              <Icon name="coffee" className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
              Solo Cafe
            </span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-warm-700 md:flex">
            <Link href="#features" className="hover:text-terracotta-600">Funciones</Link>
            <Link href="#como-funciona" className="hover:text-terracotta-600">Como funciona</Link>
            <Link href="#precios" className="hover:text-terracotta-600">Precios</Link>
            <Link href="#preguntas" className="hover:text-terracotta-600">Preguntas</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/auth/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/signup">Crear cuenta gratis</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-terracotta-100/50 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-warm-200 bg-paper px-4 py-1.5 text-sm text-muted-foreground shadow-xs">
            <span className="inline-flex h-2 w-2 rounded-full bg-sage-500" />
            Plataforma en vivo para cafeterias independientes
          </div>
          <h1 className="mx-auto max-w-4xl font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-6xl sm:leading-[1.1]">
            Vende para recoger sin depender de nadie
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Tu propia pagina de pedidos, tu menu, tus pagos y tu cocina organizada. Sin comisiones abusivas, sin apps de terceros, sin perder tu marca.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/signup">Empieza gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/demo">Ver demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Configura tu cafeteria en menos de 30 minutos. No requiere tarjeta.
          </p>
        </div>
      </section>

      <section className="border-y border-warm-200 bg-paper px-6 py-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Hecho para cafeterias independientes como la tuya
          </p>
        </div>
      </section>

      <section id="features" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Todo lo que necesitas para vender en linea
            </h2>
            <p className="mt-4 text-muted-foreground">
              Deja de perder margen con marketplaces. Con Solo Cafe controlas la experiencia, los datos y los pagos.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Icon name="store" className="h-6 w-6" />}
              title="Tu propia pagina de pedidos"
              description="Una pagina con la identidad de tu cafeteria. Compartela por QR, redes o WhatsApp. Los clientes compran sin instalar nada."
            />
            <FeatureCard
              icon={<Icon name="receipt" className="h-6 w-6" />}
              title="Menu que administras en minutos"
              description="Categorias, productos, modificadores y fotos. Activa o desactiva items en tiempo real desde tu telefono."
            />
            <FeatureCard
              icon={<Icon name="credit-card" className="h-6 w-6" />}
              title="Pagos directos a tu cuenta"
              description="Conecta Stripe Connect y recibe el dinero directamente. Tu decides si hay comision de plataforma."
            />
            <FeatureCard
              icon={<Icon name="utensils" className="h-6 w-6" />}
              title="Cocina organizada en tiempo real"
              description="Visualiza pedidos en una tablet, actualiza estados y avisa a los clientes cuando su orden esta lista."
            />
            <FeatureCard
              icon={<Icon name="clock" className="h-6 w-6" />}
              title="Horarios sin saturacion"
              description="Tus clientes eligen ASAP o un horario de recogida. Limites de capacidad para que la barra no se colapse."
            />
            <FeatureCard
              icon={<Icon name="qrcode" className="h-6 w-6" />}
              title="QR listo para imprimir"
              description="Genera un codigo QR unico para tu cafeteria. Colocalo en mesas, ventanas o en la entrada."
            />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-warm-100 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              En 30 minutos estas vendiendo
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sin integraciones complejas ni configuraciones tecnicas.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Crea tu cafeteria"
              description="Registrate, configura tu nombre, moneda, zona horaria y conecta tu cuenta de Stripe."
            />
            <StepCard
              number="2"
              title="Sube tu menu"
              description="Agrega categorias, productos, modificadores y fotos. Previsualiza como lo vera el cliente."
            />
            <StepCard
              number="3"
              title="Comparte tu QR"
              description="Imprime o comparte el enlace. Los clientes ordenan, pagan y tu recibes el pedido en la cocina."
            />
          </div>
        </div>
      </section>

      <section id="precios" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Precio justo por volumen
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sin costos ocultos. Solo pagas una comision pequena segun cuanto vendes.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
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

      <section id="preguntas" className="bg-warm-100 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            <FaqItem
              question="Necesito tarjeta de credito para empezar?"
              answer="No. Puedes crear tu cuenta y configurar tu menu gratis. Solo conectas Stripe cuando quieras recibir pagos."
            />
            <FaqItem
              question="Cuanto tarda en estar lista mi pagina?"
              answer="La mayor parte de las cafeterias estan vendiendo en menos de 30 minutos: crear cuenta, subir el menu y compartir el QR."
            />
            <FaqItem
              question="Puedo cobrar en efectivo?"
              answer="Si. Aunque la plataforma esta optimizada para pagos con tarjeta, puedes registrar pedidos pagados en efectivo desde el dashboard."
            />
            <FaqItem
              question="Que pasa si se me acaba un producto?"
              answer="Desde tu telefono o tablet puedes marcar cualquier producto como agotado en segundos. Desaparece de la pagina del cliente automaticamente."
            />
          </div>
        </div>
      </section>

      <section className="bg-espresso-900 px-6 py-20 text-espresso-50 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
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
              <Link href="/demo">Ver la demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-warm-200 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-500 text-white">
              <Icon name="coffee" className="h-4 w-4" />
            </div>
            <span className="font-serif font-semibold text-foreground">Solo Cafe</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Hecho para cafeterias independientes.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground">Entrar</Link>
            <Link href="/auth/signup" className="hover:text-foreground">Crear cuenta</Link>
          </div>
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
    <Card variant="outline" className="p-6 transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-700">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
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
    <div className="relative rounded-2xl bg-paper p-8 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-espresso-700 text-lg font-bold text-white">
        {number}
      </div>
      <h3 className="font-serif text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
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
      variant="outline"
      className={`relative p-6 transition-shadow hover:shadow-md ${highlighted ? "border-terracotta-400 bg-terracotta-50/30 ring-1 ring-terracotta-400" : ""}`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-terracotta-500 px-3 py-0.5 text-xs font-medium text-white">
          Mas popular
        </span>
      )}
      <h3 className="font-serif text-lg font-semibold text-foreground">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">
        <span className="text-3xl font-bold text-foreground">{fee}</span>
        <span className="text-muted-foreground"> / por pedido</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{volume}</p>
      <Button asChild className="mt-6 w-full" variant={highlighted ? 'primary' : 'outline'}>
        <Link href="/auth/signup">Elegir plan</Link>
      </Button>
    </Card>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-warm-200 bg-paper p-6">
      <h3 className="font-serif text-lg font-semibold text-foreground">{question}</h3>
      <p className="mt-2 text-muted-foreground">{answer}</p>
    </div>
  );
}
