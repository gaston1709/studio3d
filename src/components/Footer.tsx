export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Studio <span className="text-[#FF4F00]">3D</span></h2>
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
              Servicio de manufactura aditiva y optimización de piezas. Desde prototipos visuales hasta componentes funcionales y técnicos listos para usar.
            </p>
          </div>

          <div className="flex flex-col md:items-end text-left md:text-right space-y-6">
            <p className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.3em]">Contacto Directo</p>
            <div className="space-y-4">
              <a href="mailto:info@sie.com.ar" className="block text-2xl md:text-3xl font-black hover:text-[#FF4F00] transition-colors tracking-tighter">info@sie.com.ar</a>
              <div className="flex gap-6 md:justify-end">
                <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Instagram</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">© 2026 Studio3D. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="/terms" className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-[#FF4F00] transition-colors">Términos de Servicio</a>
            <a href="#" className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-[#FF4F00] transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
