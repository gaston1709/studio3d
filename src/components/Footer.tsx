export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-5 space-y-8">
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Studio <span className="text-[#FF4F00]">3D</span></h2>
            <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
              Laboratorio de manufactura aditiva y prototipado rápido de alta fidelidad. 
              Especialistas en materiales técnicos para aplicaciones industriales y finales.
            </p>
          </div>

          <div className="md:col-span-3 space-y-6">
            <p className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.3em]">Operatividad</p>
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <p className="text-xs font-black uppercase tracking-widest">Sistemas Activos</p>
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Locación</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-300">Córdoba, Argentina</p>
               </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <p className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.3em]">Contacto Directo</p>
            <div className="space-y-4">
              <a href="mailto:info@sie.com.ar" className="block text-2xl md:text-3xl font-black hover:text-[#FF4F00] transition-colors tracking-tighter">info@sie.com.ar</a>
              <div className="flex gap-6">
                <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">© 2026 S3D Industrial Solutions. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="/terms" className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-[#FF4F00] transition-colors">Términos de Servicio</a>
            <a href="#" className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-[#FF4F00] transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
