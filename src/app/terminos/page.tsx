import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalSection, LegalTemplatePage } from '@/components/landing/legal-template-page'
import { LegalEmailLink, LegalPlaceholder } from '@/components/landing/legal-placeholder'

export const metadata: Metadata = {
  title: 'Condiciones de uso',
  description: 'Condiciones de uso de Solo Café, programa de pedidos para recoger. Los datos de la empresa están pendientes de completar.',
}

export default function TerminosPage() {
  return (
    <LegalTemplatePage title="Condiciones de uso">
      <LegalSection id="object" title="Objeto">
        <p>
          Estas condiciones regulan el uso de Solo Café, un programa para que una cafetería reciba pedidos pagados por adelantado y los entregue en el local. El servicio lo presta <LegalPlaceholder name="legalName" />, con NIF o CIF <LegalPlaceholder name="taxId" />, domicilio en <LegalPlaceholder name="address" />, correo <LegalEmailLink /> e inscripción <LegalPlaceholder name="registry" />.
        </p>
        <p>
          Hay dos relaciones distintas. La cafetería contrata el programa. Quien pide contrata la comida con esa cafetería. <LegalPlaceholder name="legalName" /> no elabora los productos, no es la vendedora del café y no reparte a domicilio.
        </p>
      </LegalSection>

      <LegalSection id="acceptance" title="Aceptación">
        <p>
          La cafetería acepta estas condiciones al crear la cuenta. Quien pide las acepta al pagar el pedido. Navegar por la página pública no exige aceptarlas. Si no estás de acuerdo, no abras la cuenta y no envíes el pedido.
        </p>
        <p>
          La versión en español es la que rige. La fecha de esta versión es <LegalPlaceholder name="updatedAt" />.
        </p>
      </LegalSection>

      <LegalSection id="cafe-account" title="Cuenta de la cafetería">
        <p>
          El alta es para quien pueda obligar al negocio. Hay que dar un correo real y una contraseña de al menos 8 caracteres, y custodiar el acceso. La actividad hecha desde la cuenta se entiende hecha por la cafetería.
        </p>
        <p>
          La cafetería publica su carta, sus precios, sus horarios y su dirección, y decide si acepta recogida. También puede dar acceso a su personal. Es responsable de que esos datos sean ciertos y de retirar el acceso de quien ya no trabaje allí.
        </p>
        <p>
          Al subir el nombre del local, la carta o una foto, la cafetería garantiza que puede usarlos y concede a <LegalPlaceholder name="legalName" /> una licencia no exclusiva, gratuita y limitada a alojarlos y mostrarlos para prestar el servicio. No se ceden la marca ni las fotos.
        </p>
      </LegalSection>

      <LegalSection id="customer" title="Quién pide para recoger">
        <p>
          Se puede pedir sin crear cuenta. El pedido pide un nombre para llamarlo y un teléfono para avisos del local. El correo es voluntario salvo que se cree una cuenta. La cuenta de cliente sirve para ver pedidos, guardar una tarjeta si se quiere y usar favoritos o el pedido habitual.
        </p>
        <p>
          El servicio no está dirigido a menores de 14 años. Quien pide debe poder celebrar la compraventa con la cafetería.
        </p>
      </LegalSection>

      <LegalSection id="order" title="Pedido, pago y recogida">
        <p>
          El contrato de compraventa es entre quien pide y la cafetería, en el momento en que el pago queda confirmado. Hasta entonces el pedido no entra en cocina. La cocina prepara pedidos con el pago confirmado.
        </p>
        <p>
          El precio del producto, los extras y el premio de sellos, si existe, los fija la cafetería y se muestran antes de pagar. El cobro lo recibe la cafetería a través de su cuenta en el proveedor de pago (Stripe en esta versión del programa). <LegalPlaceholder name="legalName" /> no custodia el número completo de la tarjeta.
        </p>
        <p>
          La recogida es en el local, en el turno que la cafetería tenga disponible. La cafetería marca la capacidad de cada turno. Si un turno está lleno, no se puede reservar. Las instrucciones del pedido son orientativas: la cafetería las atiende si puede prepararlas con su carta.
        </p>
        <p>
          Si la cafetería usa sellos, las reglas visibles en su página (cuántos sellos y qué premio) son las que aplican. El premio lo entrega la cafetería. La plataforma solo anota los sellos del pedido pagado.
        </p>
      </LegalSection>

      <LegalSection id="fee" title="Precio del programa para la cafetería">
        <p>
          La tarifa del programa es la que publique la página de precios en ese momento, en euros. Si esa página indica que el piloto no tiene coste, no hay cuota ni comisión hasta que se publique otra tarifa, y esa tarifa nueva se verá antes de aplicarse. Esta plantilla no fija un precio.
        </p>
        <p>
          Hay que indicar, junto a cualquier precio de pago, si el IVA va incluido. El impuesto de la venta de comida corresponde a la cafetería. El de la tarifa del programa, cuando exista, corresponde a <LegalPlaceholder name="legalName" />.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" title="Cancelación y desistimiento">
        <p>
          Los productos se preparan para recoger en el momento. El derecho de desistimiento de 14 días puede no aplicarse a bienes confeccionados según las indicaciones de la persona consumidora o que puedan deteriorarse con rapidez, en los casos del artículo 103 del texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios. Esta cláusula no renuncia a ningún derecho que la ley impida excluir.
        </p>
        <p>
          La cafetería puede fijar si admite una cancelación antes de empezar a preparar. Un reembolso, cuando proceda, lo realiza la cafetería a través del proveedor de pago. Esta plantilla no promete un reembolso automático ni un botón de anulación para la persona que pide.
        </p>
      </LegalSection>

      <LegalSection id="cafe-duties" title="Obligaciones de la cafetería">
        <ul className="list-disc space-y-2 pl-5">
          <li>Tener las licencias necesarias para elaborar y vender los productos.</li>
          <li>Cumplir la normativa sanitaria y la de información alimentaria, incluidos los alérgenos que la norma exija indicar.</li>
          <li>Mostrar precios finales claros y preparar el pedido pagado con la calidad anunciada.</li>
          <li>Tratar los datos de su clientela como responsable, con la información del RGPD, y no usarlos para publicidad ajena al servicio sin base jurídica.</li>
          <li>Atender las reclamaciones de consumo por la comida vendida.</li>
        </ul>
        <p>
          <LegalPlaceholder name="legalName" /> puede suspender una cuenta si hay un uso ilícito, un fraude, un riesgo para quien pide o un incumplimiento grave de estas condiciones. Se avisará al correo de la cuenta cuando sea posible, salvo urgencia de seguridad.
        </p>
      </LegalSection>

      <LegalSection id="use" title="Uso aceptable">
        <p>
          No está permitido usar el servicio para un fin ilícito, suplantar a otra persona, interferir en el programa, extraer datos de forma masiva, ni publicar una carta que infrinja derechos de terceros. La cafetería no presentará como propia una marca que no pueda usar.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="Propiedad intelectual">
        <p>
          El programa, su diseño y los textos de la plataforma corresponden a <LegalPlaceholder name="legalName" /> o a sus licenciantes. La cafetería recibe una licencia limitada, no exclusiva e intransferible para usar el programa mientras la cuenta esté activa. No incluye el código fuente ni el derecho a revender el programa.
        </p>
        <p>
          El nombre Solo Café identifica el servicio. Esta plantilla no afirma que la marca esté registrada.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Disponibilidad y responsabilidad">
        <p>
          El programa se ofrece de forma continuada en lo razonable, sin un compromiso de disponibilidad permanente. Puede haber pausas por mantenimiento o por causas ajenas.
        </p>
        <p>
          Frente a la cafetería, la responsabilidad por el programa se limita al daño previsible. Cuando exista una tarifa de pago, el límite es el importe pagado por esa cafetería por el programa en los doce meses anteriores al hecho. No se limita la responsabilidad por dolo o culpa grave, ni la que la ley no permita limitar. Durante un piloto sin coste, ese límite económico no se usa para excluir el dolo o la culpa grave.
        </p>
        <p>
          Frente a la persona consumidora no se excluyen los derechos irrenunciables. Las reclamaciones por el producto, el retraso de preparación o la calidad se dirigen a la cafetería vendedora.
        </p>
      </LegalSection>

      <LegalSection id="end" title="Duración, baja y cambios">
        <p>
          La cuenta sigue activa hasta que la cafetería deja de usarla o se suspende por las causas de estas condiciones. Quien pide puede dejar de usar el servicio en cualquier momento y, si tiene cuenta, puede pedir la supresión según la página de <Link href="/privacidad" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">Privacidad</Link>.
        </p>
        <p>
          Las condiciones pueden actualizarse. La versión publicada en esta página es la vigente, con la fecha <LegalPlaceholder name="updatedAt" />. Una tarifa nueva no se aplica hasta que esté publicada. Cuando el correo real sustituya a <LegalPlaceholder name="email" />, los cambios relevantes para las cafeterías se avisarán por ese correo antes de aplicarse.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Ley aplicable y contacto">
        <p>
          Estas condiciones se rigen por la ley española. Para las cafeterías, los juzgados del domicilio indicado en <LegalPlaceholder name="address" /> conocen de los conflictos, salvo norma imperativa. Las personas consumidoras conservan el fuero de su domicilio y el resto de fueros imperativos.
        </p>
        <p>
          Si una cláusula se declara nula, el resto sigue en vigor. Lo no cubierto aquí se completa con el <Link href="/aviso-legal" className="font-medium text-terracotta-800 underline decoration-terracotta-300 underline-offset-4 hover:text-foreground">aviso legal</Link>, la información de privacidad y la página de cookies.
        </p>
        <p>
          Para cualquier aviso sobre estas condiciones escribe a <LegalEmailLink />. No hay otro canal publicado en esta plantilla.
        </p>
      </LegalSection>
    </LegalTemplatePage>
  )
}
