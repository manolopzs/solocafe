import type { Metadata } from 'next'
import { LegalSection, LegalTemplatePage } from '@/components/landing/legal-template-page'
import { LegalEmailLink, LegalPlaceholder } from '@/components/landing/legal-placeholder'

export const metadata: Metadata = {
  title: 'Aviso legal',
  description: 'Aviso legal de Solo Café según la LSSI-CE. Los datos de la empresa están pendientes de completar.',
}

export default function AvisoLegalPage() {
  return (
    <LegalTemplatePage title="Aviso legal">
      <LegalSection id="identity" title="Datos identificativos">
        <p>
          Este aviso cumple la información general del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE). El titular del sitio y del servicio Solo Café es <LegalPlaceholder name="legalName" />, con NIF o CIF <LegalPlaceholder name="taxId" />, domicilio en <LegalPlaceholder name="address" /> y correo <LegalEmailLink />.
        </p>
        <p>
          Datos de inscripción registral: <LegalPlaceholder name="registry" />. Si la sociedad no está obligada a inscribirse, se sustituirá este marcador por esa aclaración. No se publica un teléfono porque esta plantilla no incluye ninguno.
        </p>
        <p>
          Solo Café es el nombre del servicio. Esta plantilla no afirma que sea una marca registrada. La actividad consiste en ofrecer a cafeterías un programa para recibir pedidos pagados por adelantado y entregarlos en el local, en régimen de recogida. No es un marketplace que compre y revenda la comida, ni un servicio de reparto a domicilio.
        </p>
        <p>
          La actividad de software no se presenta aquí como sujeta a autorización administrativa previa. Si <LegalPlaceholder name="legalName" /> necesitara un código de autorización, se añadirá en esta página. No consta adhesión a un código de conducta. Si la hubiera, se identificará aquí.
        </p>
      </LegalSection>

      <LegalSection id="site" title="Condiciones de uso del sitio">
        <p>
          El acceso a las páginas públicas es libre. Crear una cuenta de cafetería o pagar un pedido implica aceptar las condiciones de uso publicadas en Términos, la información de privacidad y este aviso. Si no estás de acuerdo, no crees la cuenta y no envíes el pedido.
        </p>
        <p>
          Los precios que paga la cafetería por el programa, cuando existan, se muestran en la página de inicio, en euros. Esta plantilla no fija una tarifa ni dice si ese precio lleva el IVA incluido: hay que indicarlo junto al dato fiscal real. El precio de cada bebida o comida lo fija la cafetería en su carta.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="Propiedad intelectual e industrial">
        <p>
          El programa, los textos de este sitio, el diseño y los elementos gráficos propios corresponden a <LegalPlaceholder name="legalName" /> o a sus licenciantes. Queda prohibida la reproducción, distribución o transformación no autorizada, salvo el uso normal del servicio y los límites legales de cita.
        </p>
        <p>
          La cafetería conserva los derechos sobre su nombre, su carta, sus precios y las fotos que suba. Al publicarlas concede una licencia no exclusiva para alojarlas y mostrarlas a quien pida, solo para prestar el servicio. Las ilustraciones de la página de inicio son dibujos del producto, no capturas de una cafetería real.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Responsabilidad">
        <p>
          <LegalPlaceholder name="legalName" /> procura que el sitio esté disponible y que la información sea correcta, sin garantizar un funcionamiento ininterrumpido ni la ausencia de errores. No responde del uso que cada cafetería haga de su carta, ni de la elaboración, la seguridad alimentaria o la entrega del producto, que corresponden a la cafetería.
        </p>
        <p>
          Los enlaces a sitios de terceros, si aparecen, se ofrecen para facilitar una gestión (por ejemplo el pago). <LegalPlaceholder name="legalName" /> no controla esos sitios ni hace propios sus contenidos. El proveedor de pago actual del cobro con tarjeta es Stripe. Si cambia, este aviso debe actualizarse.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Legislación aplicable">
        <p>
          Este aviso se rige por la ley española. Para las cafeterías, que contratan como profesionales, los conflictos se someten a los juzgados del domicilio indicado en <LegalPlaceholder name="address" />, salvo norma imperativa. Las personas consumidoras conservan los fueros que la ley les reconoce, incluido el de su domicilio.
        </p>
        <p>
          Para el tratamiento de datos personales se aplica el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). Las cookies se informan en la página Cookies, conforme a la guía de la Agencia Española de Protección de Datos y al artículo 22.2 de la LSSI-CE.
        </p>
      </LegalSection>
    </LegalTemplatePage>
  )
}
