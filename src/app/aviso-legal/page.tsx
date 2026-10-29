import type { Metadata } from 'next'
import { LegalDraftPage } from '@/components/landing/legal-draft-page'

export const metadata: Metadata = {
  title: 'Aviso legal',
}

export default function AvisoLegalPage() {
  return (
    <LegalDraftPage title="Aviso legal">
      <p>
        Este aviso legal es un borrador pendiente de revisión legal. No sustituye el texto definitivo ni un asesoramiento jurídico.
      </p>
      <p>
        Solo Café es una herramienta para que una cafetería reciba pedidos pagados para recoger. Los datos identificativos del responsable se completarán en los campos marcados antes de publicar esta página.
      </p>
    </LegalDraftPage>
  )
}
