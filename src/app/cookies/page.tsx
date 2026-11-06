import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalSection, LegalTemplatePage } from '@/components/landing/legal-template-page'
import { LegalEmailLink, LegalPlaceholder } from '@/components/landing/legal-placeholder'

export const metadata: Metadata = {
  title: 'Cookies',
  description: 'Información sobre cookies y tecnologías similares de Solo Café, según la guía de la AEPD. Solo se describen las técnicas ya usadas.',
}

const cookieRows = [
  {
    name: 'token',
    owner: 'Primera parte (este sitio)',
    purpose: 'Mantener la sesión de quien entra como cafetería o como cliente. Es HttpOnly y SameSite Lax. En producción solo viaja por HTTPS.',
    duration: 'Máximo 7 días, o hasta cerrar la sesión',
    kind: 'Técnica. Exenta de consentimiento (art. 22.2 LSSI-CE)',
  },
]

const storageRows = [
  {
    name: 'solocafe.cart y el identificador del local',
    owner: 'Primera parte, almacenamiento local del navegador',
    purpose: 'Recordar las líneas del pedido en curso en ese navegador (producto, cantidad y modificadores). No guarda el nombre ni el teléfono.',
    duration: 'Hasta vaciar el pedido o borrar los datos del sitio',
    kind: 'Técnica, tecnología similar',
  },
  {
    name: 'solo-cafe.recent-shops',
    owner: 'Primera parte, almacenamiento local del navegador',
    purpose: 'Recordar hasta cinco cafeterías abiertas hace poco (nombre y identificador público).',
    duration: 'Hasta borrar los datos del sitio',
    kind: 'Técnica, tecnología similar',
  },
  {
    name: 'payment-sync y el identificador del pedido',
    owner: 'Primera parte, almacenamiento de sesión',
    purpose: 'Evitar repetir la confirmación al volver del pago. El valor guardado es una marca de control.',
    duration: 'Hasta cerrar la pestaña',
    kind: 'Técnica, tecnología similar',
  },
]

export default function CookiesPage() {
  return (
    <LegalTemplatePage title="Cookies">
      <LegalSection id="what" title="Qué son">
        <p>
          Una cookie es un pequeño archivo que el sitio guarda en el navegador. También hay tecnologías similares, como el almacenamiento local, que la guía de cookies de la Agencia Española de Protección de Datos (AEPD) trata con las mismas reglas de información.
        </p>
        <p>
          La responsable de las cookies de este sitio es <LegalPlaceholder name="legalName" />. El correo para cualquier pregunta es <LegalEmailLink />. El resto de datos identificativos está en el recuadro de arriba y en el <Link href="/aviso-legal" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">aviso legal</Link>.
        </p>
      </LegalSection>

      <LegalSection id="technical" title="Cookies técnicas de este sitio">
        <p>
          Este sitio usa una sola cookie propia, necesaria para la sesión. No pide consentimiento previo porque el artículo 22.2 de la LSSI-CE exceptúa las cookies técnicas que permiten un servicio pedido expresamente por la persona.
        </p>
        <CookieTable caption="Cookie de sesión" rows={cookieRows} />
      </LegalSection>

      <LegalSection id="storage" title="Tecnologías similares">
        <p>
          El navegador guarda en el propio dispositivo tres datos técnicos. No salen a un tercero de publicidad y no se usan para medir audiencias.
        </p>
        <CookieTable caption="Almacenamiento del navegador" rows={storageRows} />
        <p>
          La ubicación de Explorar no se guarda en una cookie. Si la autorizas, viaja en esa visita para ordenar cafeterías. Se explica en <Link href="/privacidad" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">Privacidad</Link>.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="Cookies durante el pago">
        <p>
          Al pagar, la página de cobro carga Stripe para que la cafetería cobre la tarjeta, Apple Pay o Google Pay. Stripe puede instalar cookies suyas, necesarias para completar ese pago y reducir el fraude. Son del proveedor de pago, no un inventario de analítica de <LegalPlaceholder name="legalName" />.
        </p>
        <p>
          Esta plantilla no copia la lista de cookies de Stripe, porque cambia y no debe publicarse como si se hubiera auditado aquí. La información vigente está en la política de privacidad de Stripe (stripe.com/es/privacy). Si el proveedor de pago cambia, hay que rehacer este apartado.
        </p>
      </LegalSection>

      <LegalSection id="not-used" title="Lo que este sitio no usa">
        <p>
          No se instalan cookies de analítica, publicidad, redes sociales ni perfiles. No hay un panel de aceptación porque, con solo cookies técnicas propias, la AEPD no exige un banner de consentimiento. El enlace a esta página está en el pie de la portada.
        </p>
        <p>
          Si más adelante se añadiera una cookie opcional, habrá que pedir el consentimiento antes de instalarla, con un rechazo tan fácil como la aceptación, y actualizar esta tabla. No se condicionará el pedido a aceptar cookies que no sean técnicas.
        </p>
      </LegalSection>

      <LegalSection id="manage" title="Cómo gestionarlas">
        <p>
          Puedes borrar o bloquear cookies desde la configuración del navegador. Si bloqueas la cookie técnica de sesión, tendrás que entrar de nuevo para usar la cuenta. Borrar el almacenamiento del sitio vacía el carrito guardado en ese navegador y la lista de cafeterías recientes.
        </p>
        <p>
          Los navegadores habituales explican el proceso en su propia ayuda (Chrome, Firefox, Safari, Edge). Esta página no enlaza a un manual concreto para no quedar desactualizada.
        </p>
        <p>
          Para cualquier duda sobre estas cookies escribe a <LegalEmailLink />. La guía de la AEPD está en aepd.es.
        </p>
      </LegalSection>
    </LegalTemplatePage>
  )
}

function CookieTable({
  caption,
  rows,
}: {
  caption: string
  rows: { name: string; owner: string; purpose: string; duration: string; kind: string }[]
}) {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        <p className="font-semibold text-terracotta-800">{caption}</p>
        {rows.map((row) => (
          <dl key={row.name} className="space-y-3 rounded-2xl border border-terracotta-200 bg-cream p-4 text-sm">
            <div>
              <dt className="font-semibold text-terracotta-800">Nombre</dt>
              <dd className="mt-1 break-words font-semibold text-foreground">{row.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-terracotta-800">Titular</dt>
              <dd className="mt-1">{row.owner}</dd>
            </div>
            <div>
              <dt className="font-semibold text-terracotta-800">Finalidad</dt>
              <dd className="mt-1">{row.purpose}</dd>
            </div>
            <div>
              <dt className="font-semibold text-terracotta-800">Duración</dt>
              <dd className="mt-1">{row.duration}</dd>
            </div>
            <div>
              <dt className="font-semibold text-terracotta-800">Tipo</dt>
              <dd className="mt-1">{row.kind}</dd>
            </div>
          </dl>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border border-terracotta-200 sm:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="border-b border-terracotta-200 bg-cream px-4 py-3 text-left font-semibold text-terracotta-800">
            {caption}
          </caption>
          <thead className="bg-cream text-terracotta-800">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
              <th scope="col" className="px-4 py-3 font-semibold">Titular</th>
              <th scope="col" className="px-4 py-3 font-semibold">Finalidad</th>
              <th scope="col" className="px-4 py-3 font-semibold">Duración</th>
              <th scope="col" className="px-4 py-3 font-semibold">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-terracotta-200 align-top">
                <th scope="row" className="px-4 py-3 font-semibold text-foreground">{row.name}</th>
                <td className="px-4 py-3">{row.owner}</td>
                <td className="px-4 py-3">{row.purpose}</td>
                <td className="px-4 py-3">{row.duration}</td>
                <td className="px-4 py-3">{row.kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
