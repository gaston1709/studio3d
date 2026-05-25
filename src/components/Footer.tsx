export default function Footer() {
  return (
    <footer className="bg-[#03050a] text-slate-300 pt-24 pb-12 px-6 border-t border-slate-800/80 relative overflow-hidden">
      {/* Background technical layout line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff4f00]/40 to-transparent"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic text-white">
              Studio <span className="text-[#FF4F00] glow-text-orange">3D</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed text-sm">
              Servicio de manufactura aditiva y optimización de piezas. Desde prototipos visuales hasta componentes funcionales y técnicos listos para usar.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono select-none">
              <span>SYS_VER: v2.1.0-PROD</span>
              <span>•</span>
              <span>SYS_LOC: CORDOBA_ARG</span>
            </div>
          </div>

          <div className="flex flex-col md:items-end text-left md:text-right space-y-6">
            <p className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.3em] glow-text-orange font-mono">Contacto Directo</p>
            <div className="space-y-4">
              <a 
                href="mailto:info@sie.com.ar" 
                className="block text-2xl md:text-3xl font-black text-white hover:text-[#FF4F00] transition-colors tracking-tighter duration-300 relative group"
              >
                info@sie.com.ar
              </a>
              <div className="flex gap-6 md:justify-end">
                <a 
                  href="#" 
                  className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#ff4f00] hover:after:w-full after:transition-all"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">© 2026 Studio3D. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="/terms" className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-[#FF4F00] transition-colors">Términos de Servicio</a>
            <a href="/privacy" className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-[#FF4F00] transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
