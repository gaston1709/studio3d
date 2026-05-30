export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      {/* Header seam */}
      <div className="flex items-center gap-4">
        <span className="layer-seam flex-1" />
        <span className="seam-label whitespace-nowrap">— Protocolos y Condiciones —</span>
        <span className="layer-seam flex-1" />
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight">Términos de Servicio</h1>
      
      <div className="bg-[var(--paper)] border border-[var(--paper-line)] rounded-2xl p-8 md:p-12 warm-shadow layer-press space-y-10 text-[var(--ink)] text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> <span className="text-[var(--amber)]">01 ·</span> Gestión de Datos Personales
          </h2>
          <p className="text-[var(--ink-soft)] font-medium">
            En cumplimiento con la Ley 25.326, Studio3D informa que los datos recolectados (Email, WhatsApp, Nombre) se utilizan estrictamente para la coordinación técnica de manufactura y logística de entrega. No se comparten registros con entidades externas. El usuario puede solicitar la purga de su terminal de usuario enviando un ticket a soporte.
          </p>
        </section>

        <section>
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> <span className="text-[var(--amber)]">02 ·</span> Integridad de Activos Digitales
          </h2>
          <p className="text-[var(--ink-soft)] font-medium">
            Los archivos de ingeniería (STL, STEP, 3MF) suministrados son propiedad intelectual del cliente. Studio3D actúa como un nodo de procesamiento físico y se compromete a no divulgar, clonar ni comercializar dichos diseños. Los archivos se almacenan encriptados para facilitar órdenes recurrentes de reposición.
          </p>
        </section>

        <section>
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> <span className="text-[var(--amber)]">03 ·</span> Confirmación y Seña
          </h2>
          <p className="bg-white/60 p-6 rounded-xl border-l-2 border-[var(--amber)] italic text-sm text-[var(--ink-soft)]">
            &quot;La activación del ciclo de manufactura requiere la validación de una seña equivalente al 50% del presupuesto técnico. Una vez procesada la orden y asignada a una celda de impresión, el monto no es reembolsable debido al consumo de materia prima y reserva de tiempo operativo.&quot;
          </p>
        </section>

        <section>
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> <span className="text-[var(--amber)]">04 ·</span> Estándares de Calidad
          </h2>
          <p className="text-[var(--ink-soft)] font-medium">
            Studio3D garantiza la fidelidad dimensional respecto al archivo fuente. No obstante, no asumimos responsabilidad por fallos mecánicos derivados de errores de diseño original o selección inadecuada de parámetros técnicos por parte del cliente. Errores críticos de manufactura atribuibles a nuestras estaciones serán resueltos mediante reimpresión inmediata.
          </p>
        </section>

        <div className="pt-8 border-t border-[var(--paper-line)] text-center">
          <p className="mono text-[9px] uppercase tracking-[0.28em] text-[var(--ink-soft)]/60">Revisión: Mayo 2026 | Córdoba, AR | Studio3D</p>
        </div>
      </div>
    </div>
  );
}
