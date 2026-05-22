import nodemailer from "nodemailer";

// Configuración de Nodemailer usando variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "25"),
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para otros
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
  tls: {
    // Permite certificados auto-firmados si es necesario en THE IRON
    rejectUnauthorized: false,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const from = process.env.EMAIL_FROM || "S3D <no-reply@sie.com.ar>";

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(
      `📧 [MAILER SUCCESS] MessageId: ${info.messageId} | To: ${to} | Response: ${info.response}`
    );

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const err = error as { code?: string; response?: string; stack?: string };
    console.error(
      `❌ [MAILER ERROR] Code: ${err.code} | To: ${to} | Response: ${err.response}`
    );
    console.error(err.stack);
    return { success: false, error };
  }
}

// Templates específicos para S3D
export const mailTemplates = {
  orderReceived: (orderId: string, fileName: string) => ({
    subject: `Recibimos tu archivo: ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Configuración Recibida</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Hola,</p>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Hemos recibido correctamente tu archivo <strong>${fileName}</strong> y los parámetros técnicos.</p>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Nuestro equipo técnico está analizando la viabilidad de la pieza para generar tu cotización. Te avisaremos apenas esté lista.</p>
        
        <div style="margin: 40px 0; padding: 24px; background-color: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
          <p style="margin: 0; font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.2em;">ID DE SEGUIMIENTO</p>
          <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 900; color: #000;">#${orderId.substring(0, 8).toUpperCase()}</p>
        </div>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  orderQuoted: (orderId: string, fileName: string, price: number) => ({
    subject: `Cotización Lista: ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Cotización Lista</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">El análisis técnico para <strong>${fileName}</strong> ha finalizado.</p>
        
        <div style="margin: 40px 0; padding: 32px; background-color: #000; border-radius: 24px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
          <p style="margin: 0; font-size: 10px; font-weight: 900; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.3em; opacity: 0.5;">Inversión Estimada</p>
          <p style="margin: 12px 0; font-size: 48px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.05em;">$${price.toFixed(
            2
          )}</p>
          <a href="${
            process.env.NEXTAUTH_URL
          }/orders" style="display: inline-block; margin-top: 12px; padding: 16px 32px; background-color: #FFFFFF; color: #000; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">Confirmar Manufactura</a>
        </div>

        <p style="color: #444; font-size: 14px; line-height: 1.6; font-style: italic;">* Para iniciar la producción se requiere el pago de la seña correspondiente.</p>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  orderInQueue: (orderId: string, fileName: string) => ({
    subject: `Pago Verificado: ${fileName} en cola - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Producción Iniciada</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Hemos verificado tu pago satisfactoriamente.</p>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Tu pieza <strong>${fileName}</strong> ya se encuentra en nuestra cola de impresión industrial.</p>
        
        <div style="margin: 40px 0; padding: 24px; background-color: #fff; border-radius: 16px; border-left: 4px solid #10b981;">
          <p style="margin: 0; font-size: 14px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">ESTADO: EN COLA</p>
        </div>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  orderPrinting: (orderId: string, fileName: string) => ({
    subject: `En Proceso: Imprimiendo ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Manufacturando...</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Estamos forjando tu diseño en este momento.</p>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">La tecnología Bambu Lab está trabajando en <strong>${fileName}</strong> con la máxima precisión.</p>
        
        <div style="margin: 40px 0; text-align: center;">
           <div style="width: 12px; h-12px; background-color: #3b82f6; border-radius: 50%; display: inline-block; margin-right: 8px;"></div>
           <span style="font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #3b82f6;">Ciclo de Impresión Activo</span>
        </div>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  orderReady: (orderId: string, fileName: string) => ({
    subject: `¡Listo para Entregar! ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Pieza Finalizada</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">¡Excelentes noticias! Tu pedido <strong>${fileName}</strong> ha superado el control de calidad y está listo para ser retirado o enviado.</p>
        
        <div style="margin: 40px 0; padding: 32px; background-color: #10b981; border-radius: 24px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em;">¡LISTO PARA ENTREGA!</p>
        </div>

        <p style="color: #444; font-size: 16px; line-height: 1.6;">Ya podés pasar por el nodo de retiro o esperar la confirmación de envío si seleccionaste logística externa.</p>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  orderFinished: (orderId: string, fileName: string) => ({
    subject: `¡Pedido Finalizado! ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Producción Finalizada</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">¡Excelentes noticias! Tu pedido <strong>${fileName}</strong> ha finalizado la etapa de manufactura y superado el control de calidad.</p>
        
        <div style="margin: 40px 0; padding: 32px; background-color: #000; border-radius: 24px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em;">PIEZA TERMINADA</p>
        </div>

        <p style="color: #444; font-size: 16px; line-height: 1.6;">Nos comunicaremos a la brevedad para coordinar el envío en caso de ser necesario, o bien ya podés pasar a retirarlo si seleccionaste retiro en local.</p>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  orderShipped: (orderId: string, fileName: string, trackingLink: string) => ({
    subject: `Tu pedido está en camino: ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Envío Iniciado</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Tu pedido <strong>${fileName}</strong> ya está en camino hacia tu destino.</p>
        
        <div style="margin: 40px 0; padding: 32px; background-color: #FF4F00; border-radius: 24px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em;">PEDIDO ENVIADO</p>
          ${trackingLink ? `<a href="${trackingLink}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #FFFFFF; color: #FF4F00; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Seguir Envío (Uber / Logística)</a>` : ''}
        </div>

        <p style="color: #444; font-size: 16px; line-height: 1.6;">Si el botón anterior no funciona, podés copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; font-size: 12px; color: #666;">${trackingLink || "No provisto"}</p>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  orderDelivered: (orderId: string, fileName: string) => ({
    subject: `Entregado: Califica tu experiencia con ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Pedido Entregado</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Tu pedido <strong>${fileName}</strong> ha sido marcado como entregado/recibido.</p>
        
        <div style="margin: 40px 0; padding: 32px; background-color: #0f172a; border-radius: 24px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em;">¡RECIBIDO!</p>
          <a href="${process.env.NEXTAUTH_URL}/orders" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #FF4F00; color: #FFFFFF; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Calificar Experiencia</a>
        </div>

        <p style="color: #444; font-size: 16px; line-height: 1.6;">Nos encantaría recibir tu opinión para seguir mejorando nuestro servicio de manufactura.</p>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  welcome: (name: string) => ({
    subject: `Bienvenido a S3D - ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #F1F5F9; padding: 40px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.1);">
        <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 24px;">Terminal Activada</h2>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Hola <strong>${name}</strong>,</p>
        <p style="color: #444; font-size: 16px; line-height: 1.6;">Gracias por registrarte en S3D. Tu terminal de usuario ya está activa y lista para procesar tus activos digitales.</p>
        
        <div style="margin: 40px 0; padding: 24px; background-color: #000; border-radius: 16px; text-align: center;">
           <a href="${process.env.NEXTAUTH_URL}/orders/new" style="color: #FFFFFF; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em;">Iniciar Nueva Cotización</a>
        </div>

        <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 40px 0;" />
        <p style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 0.3em; text-align: center;">S3D • Manufactura de Precisión</p>
      </div>
    `,
  }),

  // Admin Notifications
  adminNewOrder: (orderId: string, email: string, fileName: string) => ({
    subject: `🚨 NUEVA ORDEN: ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #fff; padding: 40px; border: 4px solid #000;">
        <h2 style="color: #000; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;">Nueva Solicitud de Cotización</h2>
        <p><strong>Usuario:</strong> ${email}</p>
        <p><strong>Archivo:</strong> ${fileName}</p>
        <div style="margin-top: 32px;">
          <a href="${process.env.NEXTAUTH_URL}/admin/orders/${orderId}" style="display: inline-block; padding: 16px 32px; background-color: #000; color: #fff; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em;">Gestionar en Panel</a>
        </div>
      </div>
    `,
  }),

  adminPaymentUploaded: (orderId: string, email: string, fileName: string) => ({
    subject: `💰 COMPROBANTE RECIBIDO: ${fileName} - S3D`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; background-color: #fff; padding: 40px; border: 4px solid #000;">
        <h2 style="color: #000; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;">Comprobante de Pago Cargado</h2>
        <p><strong>Usuario:</strong> ${email}</p>
        <p><strong>Pedido:</strong> ${fileName}</p>
        <div style="margin-top: 32px;">
          <a href="${process.env.NEXTAUTH_URL}/admin/orders/${orderId}" style="display: inline-block; padding: 16px 32px; background-color: #000; color: #fff; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em;">Verificar Pago</a>
        </div>
      </div>
    `,
  }),
};
