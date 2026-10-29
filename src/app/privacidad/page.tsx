import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalSection, LegalTemplatePage } from '@/components/landing/legal-template-page'
import { LegalEmailLink, LegalPlaceholder } from '@/components/landing/legal-placeholder'

export const metadata: Metadata = {
  title: 'Privacidad',
  description: 'Información sobre el tratamiento de datos de Solo Café según el RGPD y la LOPDGDD. Los datos del responsable están pendientes.',
}

export default function PrivacidadPage() {
  return (
    <LegalTemplatePage title="Privacidad">
      <LegalSection id="controller" title="Responsable del tratamiento">
        <p>
          El responsable del sitio, de las cuentas de cafetería y de la seguridad de la plataforma es <LegalPlaceholder name="legalName" />, con NIF o CIF <LegalPlaceholder name="taxId" />, domicilio en <LegalPlaceholder name="address" /> y correo <LegalEmailLink />. Datos registrales: <LegalPlaceholder name="registry" />.
        </p>
        <p>
          Quien pide un café contrata la comida con la cafetería, no con la plataforma. Para los datos del pedido que la cafetería decide recoger (nombre, teléfono, contenido, hora de recogida e instrucciones), la cafetería es responsable y <LegalPlaceholder name="legalName" /> actúa como encargada. El detalle está más abajo.
        </p>
      </LegalSection>

      <LegalSection id="dpo" title="Delegado de protección de datos">
        <p>
          Esta plantilla no designa un delegado de protección de datos. Si <LegalPlaceholder name="legalName" /> está obligada a nombrarlo según el artículo 34 de la LOPDGDD, o decide nombrarlo, sus datos se publicarán en esta página. Mientras tanto, las solicitudes se envían a <LegalEmailLink />.
        </p>
      </LegalSection>

      <LegalSection id="data" title="Qué datos se tratan">
        <p>Los datos dependen de cómo uses Solo Café. No se piden datos de salud, ideología ni biometría.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Cuenta de cafetería: correo, contraseña guardada como resumen criptográfico (no en claro), nombre de la persona que abre la cuenta y los datos del local que esa persona publica (nombre comercial, dirección, horarios, carta, precios, foto del local, color y tipografía).
          </li>
          <li>
            Equipo del local: correo de quien entra como personal y su papel en la cafetería.
          </li>
          <li>
            Cuenta de cliente, si se crea: correo, contraseña en forma de resumen, nombre y teléfono si se facilitan.
          </li>
          <li>
            Pedido para recoger, con o sin cuenta: nombre para llamar el pedido, teléfono, correo si se indica, productos, importes, hora de recogida, estado del pedido e instrucciones libres. En las instrucciones no hace falta escribir datos de salud.
          </li>
          <li>
            Pago: el número completo de la tarjeta lo recoge el proveedor de pago (Stripe), no la plataforma. Si guardas una tarjeta, se conservan la marca, los últimos cuatro dígitos, la caducidad y el identificador de ese proveedor.
          </li>
          <li>
            Fidelización y favoritos, si la cafetería los usa: sellos asociados al pedido y productos marcados como favoritos o como pedido habitual.
          </li>
          <li>
            Avisos: si aceptas notificaciones del navegador, se guarda la suscripción técnica para avisar de que el pedido está listo o, en el caso del personal, de que hay un pedido en cocina.
          </li>
          <li>
            Explorar: si autorizas la ubicación, el navegador envía unas coordenadas aproximadas para ordenar las cafeterías por cercanía. No se guardan en una cuenta. Si no autorizas, el directorio se muestra igual.
          </li>
          <li>
            Datos técnicos: cookie de sesión descrita en Cookies, carrito y cafeterías recientes en el almacenamiento del navegador, dirección IP y registros técnicos necesarios para la seguridad.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="purposes" title="Finalidades y bases jurídicas">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Prestar el servicio a la cafetería (cuenta, carta, pedidos en cocina, código QR y panel). Base: ejecución del contrato, artículo 6.1.b del RGPD.
          </li>
          <li>
            Tomar, cobrar y preparar el pedido para recoger, y avisar cuando esté listo si se aceptan los avisos. Base: ejecución del contrato de compraventa con la cafetería y, para el aviso push, el consentimiento del navegador, artículo 6.1.a.
          </li>
          <li>
            Restablecer la contraseña. El enlace caduca a los 30 minutos. Base: ejecución del contrato o medidas precontractuales, artículo 6.1.b.
          </li>
          <li>
            Cumplir obligaciones contables, fiscales y de la LSSI-CE. Base: obligación legal, artículo 6.1.c.
          </li>
          <li>
            Seguridad, prevención de abuso y diagnóstico técnico, incluida la dirección IP. Base: interés legítimo, artículo 6.1.f. Puedes oponerte cuando no prevalezcan motivos imperiosos.
          </li>
          <li>
            Ordenar cafeterías por cercanía. Base: consentimiento prestado al permitir la ubicación en el navegador, artículo 6.1.a. Es opcional.
          </li>
          <li>
            Sellos y favoritos que la propia persona activa en el servicio. Base: ejecución del contrato, artículo 6.1.b.
          </li>
        </ul>
        <p>
          No se usan los datos para publicidad de terceros ni para elaborar perfiles con efectos jurídicos. No se envían boletines. Si una cafetería quiere usar los datos de su clientela para su propia publicidad, debe informarlo ella y tener una base jurídica propia. La plataforma no lo hace por su cuenta.
        </p>
      </LegalSection>

      <LegalSection id="recipients" title="Destinatarios">
        <p>Los datos se comunican solo a quien hace falta para el servicio:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>La cafetería que recibe el pedido, para prepararlo y entregarlo.</li>
          <li>
            Stripe, para el cobro con tarjeta, Apple Pay o Google Pay y, si se guarda una tarjeta, para el cargo posterior. Stripe actúa como proveedor de pago y puede ser responsable de ese tratamiento.
          </li>
          <li>
            Encargados técnicos de alojamiento, base de datos, almacenamiento de archivos de la cafetería y, si está configurado, el servidor de correo usado para el restablecimiento de contraseña. Esta plantilla no sustituye sus nombres comerciales por datos inventados: al completar los marcadores hay que listar los encargados reales.
          </li>
          <li>Autoridades, cuando una norma obligue a facilitar los datos.</li>
        </ul>
        <p>No se venden datos personales.</p>
      </LegalSection>

      <LegalSection id="processor" title="Encargo de tratamiento">
        <p>
          Cuando la cafetería define qué datos pide a su clientela para el pedido, esa cafetería es la responsable y <LegalPlaceholder name="legalName" /> trata esos datos por cuenta de ella, para mostrar el pedido en cocina, registrar el estado y apoyar el cobro. El contrato de encargo del artículo 28 del RGPD debe formar parte del alta de la cafetería.
        </p>
        <p>
          Esta plantilla no da por firmado ese contrato. Hay que incorporar el texto del encargo antes de tratar datos reales de clientela. La cafetería sigue siendo quien responde ante su clientela por la venta, los alérgenos y la información del producto.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="Transferencias internacionales">
        <p>
          Stripe y algunos encargados de infraestructura pueden tratar datos fuera del Espacio Económico Europeo. Esa transferencia debe apoyarse en una decisión de adecuación o en una garantía del artículo 46 del RGPD, como cláusulas contractuales tipo. Esta plantilla no adjunta esos contratos ni afirma que ya estén firmados. Hay que comprobarlos al completar los datos de <LegalPlaceholder name="legalName" />.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="Plazos de conservación">
        <ul className="list-disc space-y-2 pl-5">
          <li>Cuenta: mientras siga activa y, después, bloqueada el tiempo necesario para atender reclamaciones y obligaciones legales.</li>
          <li>
            Pedidos y cobros: el tiempo necesario para prepararlos, resolver incidencias y cumplir los plazos de contabilidad y fiscalidad. Con carácter general, la documentación contable se conserva seis años (Código de Comercio) y las obligaciones tributarias prescriben a los cuatro (Ley General Tributaria), sin perjuicio de plazos más largos si hay una reclamación abierta.
          </li>
          <li>Enlace de restablecimiento de contraseña: 30 minutos.</li>
          <li>Cookie de sesión: máximo 7 días, o hasta cerrar la sesión.</li>
          <li>Carrito y cafeterías recientes: en el propio navegador, hasta que se borren.</li>
          <li>Ubicación de Explorar: no se guarda en la cuenta. Puede quedar en la dirección de esa visita y en registros técnicos.</li>
          <li>Suscripción de avisos: hasta que se desactiva en el navegador o deja de ser válida.</li>
          <li>Tarjeta guardada: mientras la persona no la quite y la cuenta siga activa.</li>
        </ul>
        <p>
          Esta plantilla no fija un número de días para los registros técnicos de seguridad. El criterio es conservarlos el tiempo mínimo para seguridad y diagnóstico, y no usarlos para publicidad. Al publicar, <LegalPlaceholder name="legalName" /> puede concretar ese plazo sin cambiar el resto de la información.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Derechos">
        <p>
          Puedes solicitar acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar un consentimiento sin que afecte a lo ya tratado. También puedes no ser objeto de una decisión basada solo en un tratamiento automatizado, incluido un perfil, que produzca efectos jurídicos. Solo Café no toma ese tipo de decisiones: la cocina y los turnos de recogida son operación del local, no una decisión jurídica sobre la persona.
        </p>
        <p>
          Escribe a <LegalEmailLink /> e indica el derecho que ejerces y un correo de respuesta. Si el pedido lo gestiona una cafetería como responsable, puedes dirigirte también a esa cafetería. Se responderá en el plazo de un mes, ampliable en los términos del artículo 12 del RGPD.
        </p>
        <p>
          Si consideras que el tratamiento no se ajusta a la norma, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es). Ese trámite no es obligatorio antes de escribir al responsable.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Menores">
        <p>
          El servicio no está dirigido a menores de 14 años, edad a partir de la cual la LOPDGDD permite consentir el tratamiento en España. El alta de una cafetería corresponde a quien pueda contratar por ese negocio. Si un menor ha facilitado datos, se puede pedir la supresión en <LegalEmailLink />.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Seguridad y cambios">
        <p>
          Se aplican medidas razonables de acceso, cifrado en el transporte cuando el sitio se sirve por HTTPS, y separación entre cafeterías. Ninguna medida garantiza una seguridad absoluta. Si se produjera una brecha con riesgo para los derechos de las personas, se notificará en los plazos del RGPD.
        </p>
        <p>
          Esta información puede actualizarse para reflejar cambios del servicio o de la ley. La fecha vigente es <LegalPlaceholder name="updatedAt" />. El detalle de cookies está en <Link href="/cookies" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">Cookies</Link> y las condiciones del servicio en <Link href="/terminos" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">Términos</Link>.
        </p>
      </LegalSection>
    </LegalTemplatePage>
  )
}
