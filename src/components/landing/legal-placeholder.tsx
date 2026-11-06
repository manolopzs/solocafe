import type { ReactNode } from 'react'

/**
 * Company identity tokens. The brackets are the published text until the
 * company replaces them. Do not put a real name, tax id, address, or email here.
 */
export const LEGAL_PLACEHOLDERS = {
  legalName: '[RAZON SOCIAL]',
  taxId: '[NIF/CIF]',
  address: '[DOMICILIO SOCIAL]',
  email: '[EMAIL DE CONTACTO]',
  registry: '[REGISTRO MERCANTIL]',
  updatedAt: '[FECHA DE ULTIMA ACTUALIZACION]',
} as const

export type LegalPlaceholderName = keyof typeof LEGAL_PLACEHOLDERS

const placeholderClassName =
  'box-decoration-clone rounded bg-terracotta-200 px-1.5 py-0.5 font-semibold text-terracotta-900 ring-1 ring-terracotta-500'

export function LegalPlaceholder({ name }: { name: LegalPlaceholderName }) {
  return (
    <span data-legal-placeholder={name} className={placeholderClassName}>
      {LEGAL_PLACEHOLDERS[name]}
    </span>
  )
}

export function LegalEmailLink({ children }: { children?: ReactNode }) {
  return (
    <a
      href={`mailto:${encodeURIComponent(LEGAL_PLACEHOLDERS.email)}`}
      className="text-terracotta-900 underline decoration-terracotta-500 decoration-2 underline-offset-4 hover:text-foreground"
    >
      {children ?? <LegalPlaceholder name="email" />}
    </a>
  )
}
