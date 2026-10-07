import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Pedidos para recoger, sin complicaciones
        </h1>
        <p className="mt-6 text-lg text-zinc-600">
          La plataforma de pedidos anticipados para cafeterias independientes.
          Tu menu, tu marca, tus clientes.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/login"
            className="rounded-full bg-zinc-900 px-8 py-3 text-base font-medium text-white hover:bg-zinc-800"
          >
            Entrar
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-zinc-300 px-8 py-3 text-base font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
