import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import AvisoLegalPage from '@/app/aviso-legal/page'
import CookiesPage from '@/app/cookies/page'
import ContactoPage from '@/app/contacto/page'
import PrivacidadPage from '@/app/privacidad/page'
import TerminosPage from '@/app/terminos/page'
import { LEGAL_PLACEHOLDERS } from '@/components/landing/legal-placeholder'

const pages: { name: string; Page: ComponentType }[] = [
  { name: 'aviso legal', Page: AvisoLegalPage },
  { name: 'privacidad', Page: PrivacidadPage },
  { name: 'terminos', Page: TerminosPage },
  { name: 'cookies', Page: CookiesPage },
  { name: 'contacto', Page: ContactoPage },
]

describe('legal templates', () => {
  it('publishes only the six company markers', () => {
    expect(Object.values(LEGAL_PLACEHOLDERS)).toEqual([
      '[RAZON SOCIAL]',
      '[NIF/CIF]',
      '[DOMICILIO SOCIAL]',
      '[EMAIL DE CONTACTO]',
      '[REGISTRO MERCANTIL]',
      '[FECHA DE ULTIMA ACTUALIZACION]',
    ])
  })

  it.each(pages)('highlights every marker and avoids dash copy on $name', ({ Page }) => {
    const html = renderToStaticMarkup(createElement(Page))

    for (const value of Object.values(LEGAL_PLACEHOLDERS)) {
      expect(html).toContain(value)
    }

    expect(html).toContain('data-legal-placeholder="email"')
    expect(html).toContain('bg-terracotta-200')
    expect(html).toContain('mailto:%5BEMAIL%20DE%20CONTACTO%5D')
    expect(html).not.toContain('\u2014')
    expect(html).not.toContain('\u2013')
    expect(html).not.toContain('--')
  })
})
