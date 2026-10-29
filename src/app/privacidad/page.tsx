import type { Metadata } from 'next'
import { LegalDraftPage } from '@/components/landing/legal-draft-page'

export const metadata: Metadata = {
  title: 'Privacidad',
}

export default function PrivacidadPage() {
  return (
    <LegalDraftPage title="Privacidad">
      <p>
        Esta política de privacidad es un borrador pendiente de revisión legal. No describe todavía un tratamiento de datos definitivo.
      </p>
      <p>
        Antes de la publicación se indicará qué datos recogen las cafeterías y Solo Café, con qué finalidad, durante cuánto tiempo y cómo solicitar acceso o supresión. Hasta entonces, los únicos datos de contacto son los marcadores de esta página.
      </p>
    </LegalDraftPage>
  )
}
