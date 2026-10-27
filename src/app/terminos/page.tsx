import type { Metadata } from 'next'
import { LegalDraftPage } from '@/components/landing/legal-draft-page'

export const metadata: Metadata = {
  title: 'Términos',
}

export default function TerminosPage() {
  return (
    <LegalDraftPage title="Términos">
      <p>
        Estos términos son un borrador pendiente de revisión legal. No regulan todavía el uso del servicio.
      </p>
      <p>
        El texto definitivo explicará las condiciones para las cafeterías que abren cuenta y para las personas que piden para recoger, incluido el piloto sin coste. Hasta esa revisión, no hay condiciones adicionales que aceptar.
      </p>
    </LegalDraftPage>
  )
}
