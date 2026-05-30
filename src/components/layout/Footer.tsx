export default function Footer() {
  return (
    <footer className="panel-graphite pb-12 px-6">
      {/* Closing seam — the print is finished */}
      <div className="container mx-auto pt-12 pb-16 flex items-center gap-4">
        <span className="layer-seam flex-1" />
        <span className="seam-label whitespace-nowrap">— Impresión completa —</span>
        <span className="layer-seam flex-1" />
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight leading-none text-[var(--paper)]">
              Studio <span className="text-[var(--amber)]">3D</span>
            </h2>
            <p className="text-[color-mix(in_srgb,var(--paper)_70%,transparent)] max-w-sm leading-relaxed">
              Somos un taller chico: una impresora y nosotros, atendiendo cada pieza. Desde una idea
              suelta hasta un repuesto que necesitás funcionando, lo hacemos capa por capa.
            </p>
          </div>

          <div className="flex flex-col md:items-end text-left md:text-right space-y-6">
            <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--amber-glow)]">Escribinos</p>
            <div className="space-y-4">
              <a href="mailto:info@sie.com.ar" className="block text-2xl md:text-3xl font-semibold tracking-tight text-[var(--paper)] hover:text-[var(--amber)] transition-colors duration-200">info@sie.com.ar</a>
              <div className="flex gap-6 md:justify-end">
                <a href="#" className="mono text-xs uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--paper)_55%,transparent)] hover:text-[var(--paper)] transition-colors duration-200">Instagram</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-[var(--graphite-line)] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <p className="mono text-[9px] uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--paper)_45%,transparent)]">© 2026 Studio3D. Todos los derechos reservados.</p>
            <p className="mono text-[8px] uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--paper)_25%,transparent)]">IMPRESIÓN COMPLETADA · 2026</p>
          </div>
          <div className="flex gap-8">
            <a href="/terms" className="mono text-[9px] uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--paper)_45%,transparent)] hover:text-[var(--amber)] transition-colors duration-200">Términos de Servicio</a>
            <a href="/privacy" className="mono text-[9px] uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--paper)_45%,transparent)] hover:text-[var(--amber)] transition-colors duration-200">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
