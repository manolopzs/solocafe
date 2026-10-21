import type { Metadata } from 'next'
import { LegalDraftPage } from '@/components/landing/legal-draft-page'

export const metadata: Metadata = {
  title: 'Contacto',
}

export default function ContactoPage() {
  return (
    <LegalDraftPage title="Contacto">
      <p>
        Esta página de contacto es un borrador pendiente de revisión legal. El canal público todavía no está publicado.
      </p>
      <p>
        Cuando el texto esté revisado, aquí aparecerá cómo escribir al responsable. Hasta entonces el único contacto es el marcador [correo de contacto].
      </p>
    </LegalDraftPage>
  )
}
