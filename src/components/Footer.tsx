import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-slate-400 py-24 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-20 h-10 overflow-hidden rounded-lg bg-[#FFFCDC]">
                <Image 
                  src="/logo.png" 
                  alt="S3D Logo" 
                  fill 
                  className="object-contain p-1"
                />
              </div>
            </Link>
            <p className="text-base leading-relaxed max-w-sm font-medium">
              Servicio profesional de impresión 3D y prototipado rápido con calidad industrial. 
              Ubicados en Córdoba, Argentina.
            </p>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black text-[#FFFCDC] uppercase tracking-[0.3em] mb-8">Información</h4>
            <ul className="space-y-5 text-sm font-bold">
              <li><Link href="/terms" className="hover:text-white transition-colors uppercase tracking-widest">Términos de Servicio</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors uppercase tracking-widest">Privacidad</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-[#FFFCDC] uppercase tracking-[0.3em] mb-8">Contacto</h4>
            <ul className="space-y-5 text-sm font-bold">
              <li><a href="mailto:gastongrasso@sie.com.ar" className="hover:text-white transition-colors uppercase tracking-widest">Enviar un Mensaje</a></li>
              <li className="text-[10px] font-black text-slate-600 mt-10 uppercase tracking-[0.2em]">Córdoba, Argentina</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">© 2026 S3D. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
