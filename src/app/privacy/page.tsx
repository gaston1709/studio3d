export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      {/* Header seam */}
      <div className="flex items-center gap-4">
        <span className="layer-seam flex-1" />
        <span className="seam-label whitespace-nowrap">— Privacidad de datos —</span>
        <span className="layer-seam flex-1" />
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight">Políticas de Privacidad</h1>
      
      <div className="bg-[var(--paper)] border border-[var(--paper-line)] rounded-2xl p-8 md:p-12 warm-shadow layer-press space-y-10 text-[var(--ink)] text-sm md:text-base leading-relaxed">
        <section>
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> <span className="text-[var(--amber)]">01 ·</span> Información Recopilada
          </h2>
          <p className="text-[var(--ink-soft)] font-medium">
            Recopilamos únicamente la información necesaria para el funcionamiento de Studio3D, como nombre, correo electrónico y archivos de diseño técnico proporcionados por el usuario. Esta información se emplea de manera exclusiva para gestionar presupuestos, procesar pagos y ejecutar la manufactura aditiva.
          </p>
        </section>

        <section>
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> <span className="text-[var(--amber)]">02 ·</span> Uso de la Información
          </h2>
          <p className="text-[var(--ink-soft)] font-medium">
            Studio3D utiliza la información recopilada para comunicarse con el cliente sobre el estado de sus piezas, coordinar envíos o entregas y brindar soporte técnico. En ningún caso venderemos, alquilaremos ni comercializaremos datos personales o modelos 3D a terceros u otras empresas.
          </p>
        </section>

        <section>
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> <span className="text-[var(--amber)]">03 ·</span> Seguridad de los Archivos
          </h2>
          <p className="bg-white/60 p-6 rounded-xl border-l-2 border-[var(--amber)] italic text-sm text-[var(--ink-soft)]">
            &quot;Todo activo digital (.STL, .STEP, .3MF) está resguardado en servidores seguros. Studio3D garantiza absoluta confidencialidad sobre la propiedad intelectual y el diseño del cliente.&quot;
          </p>
        </section>

        <section>
          <h2 className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-[var(--paper-line)]" /> <span className="text-[var(--amber)]">04 ·</span> Retención de Datos
          </h2>
          <p className="text-[var(--ink-soft)] font-medium">
            Mantenemos los archivos y registros de órdenes por un tiempo prudencial para facilitar reimpresiones o reclamos. Sin embargo, cualquier cliente puede exigir la purga y destrucción total de sus modelos digitales en nuestros servidores mediante una solicitud formal por nuestros canales de contacto.
          </p>
        </section>

        <div className="pt-8 border-t border-[var(--paper-line)] text-center">
          <p className="mono text-[9px] uppercase tracking-[0.28em] text-[var(--ink-soft)]/60">Revisión: Mayo 2026 | Córdoba, AR | Studio3D</p>
        </div>
      </div>
    </div>
  );
}
