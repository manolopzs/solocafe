import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalSection, LegalTemplatePage } from '@/components/landing/legal-template-page'
import { LegalEmailLink, LegalPlaceholder } from '@/components/landing/legal-placeholder'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacto de Solo Café. El correo público es un marcador pendiente de sustituir.',
}

export default function ContactoPage() {
  return (
    <LegalTemplatePage title="Contacto">
      <LegalSection id="channel" title="Cómo escribir">
        <p>
          El único canal público de esta plantilla es el correo <LegalEmailLink />. Ese recuadro no es una dirección real. Hasta que <LegalPlaceholder name="legalName" /> lo sustituya, el enlace no entrega mensajes a ninguna empresa.
        </p>
        <p>
          No se publica teléfono. El domicilio a efectos legales, cuando se complete, es <LegalPlaceholder name="address" />. No es un mostrador de atención al público.
        </p>
      </LegalSection>

      <LegalSection id="topics" title="Para qué sirve">
        <ul className="list-disc space-y-2 pl-5">
          <li>Ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad.</li>
          <li>Avisos sobre la cuenta de una cafetería y sobre estas condiciones.</li>
          <li>Señalar un error en el aviso legal, la privacidad o las cookies.</li>
        </ul>
        <p>
          Un pedido concreto se reclama a la cafetería que lo vende. La plataforma no elabora el producto.
        </p>
        <p>
          Más información en el <Link href="/aviso-legal" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">aviso legal</Link>, <Link href="/privacidad" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">privacidad</Link>, <Link href="/terminos" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">términos</Link> y <Link href="/cookies" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">cookies</Link>.
        </p>
      </LegalSection>
    </LegalTemplatePage>
  )
}
