import type { Metadata } from 'next'
import { LegalDraftPage } from '@/components/landing/legal-draft-page'

export const metadata: Metadata = {
  title: 'Cookies',
}

export default function CookiesPage() {
  return (
    <LegalDraftPage title="Cookies">
      <p>
        Este aviso de cookies es un borrador pendiente de revisión legal. No es un inventario definitivo de cookies.
      </p>
      <p>
        Cuando se revise, se indicará si el sitio usa cookies técnicas de sesión y si hay alguna cookie de medición. Hasta entonces no se declara ninguna cookie opcional.
      </p>
    </LegalDraftPage>
  )
}
