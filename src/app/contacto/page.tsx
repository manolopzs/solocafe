import type { Metadata } from 'next'
import { LegalDraftPage } from '@/components/landing/legal-draft-page'

export const metadata: Metadata = {
  title: 'Contacto',
}

export default function ContactoPage() {
  return (
    <LegalDraftPage title="Contacto">
      <p>
        ¿Tienes dudas o quieres hablar con nosotros? Escríbenos un correo y te responderemos lo antes posible.
      </p>
      <p>
        <a href="mailto:" className="text-terracotta-800 hover:underline">
          Enviar correo
        </a>
      </p>
    </LegalDraftPage>
  )
}
