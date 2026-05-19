import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // If user is admin, redirect to admin dashboard directly
  if ((session?.user as any)?.role === "ADMIN") {
    redirect("/admin");
  }

  const materials = await prisma.material.findMany({
    where: { isActive: true },
    include: { 
      colors: {
        where: { isActive: true }
      } 
    },
    take: 3,
  });

  return (
    <div className="space-y-40 pb-20">
      {/* HERO SECTION - RESTRUCTURED: LOGO LEFT, TEXT RIGHT */}
      <section className="relative pt-12 md:pt-24 min-h-[70vh] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* LEFT: BIG LOGO */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="relative w-72 h-72 md:w-[450px] md:h-[450px]">
                <Image 
                  src="/logo.png" 
                  alt="S3D Big Logo" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* RIGHT: BEAUTIFUL PALABRERIO */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <h1 className="text-6xl md:text-8xl xl:text-[10rem] font-black text-black tracking-tighter leading-[0.85] uppercase">
                IMPRIMÍ <br />
                <span className="italic opacity-20">TUS</span> IDEAS.
              </h1>
              
              <div className="max-w-xl space-y-8">
                <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed">
                  Servicio profesional de impresión 3D y prototipado rápido con calidad industrial. 
                  Hacemos que tus archivos digitales se vuelvan realidad.
                </p>

                {!session ? (
                  <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <Link 
                      href="/auth/signin" 
                      className="bg-black text-[#FFFCDC] px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-black/20 active:scale-95 text-center"
                    >
                      Ingresar
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="bg-transparent text-black border-4 border-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black hover:text-[#FFFCDC] transition-all active:scale-95 text-center"
                    >
                      Crear Cuenta
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <Link 
                      prefetch={false}
                      href="/orders/new" 
                      className="bg-black text-[#FFFCDC] px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-black/20 active:scale-95 text-center"
                    >
                      Nueva Cotización
                    </Link>
                    <Link 
                      prefetch={false}
                      href="/orders" 
                      className="bg-white/50 backdrop-blur-sm text-black border-4 border-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black hover:text-[#FFFCDC] transition-all active:scale-95 text-center"
                    >
                      Mis Pedidos
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Grid Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full -z-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
      </section>

      {/* SPECS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: "01. TECNOLOGÍA", title: "Máxima Precisión", desc: "Utilizamos tecnología Bambu Lab para garantizar piezas con tolerancias mínimas y acabados impecables." },
          { label: "02. MATERIALES", title: "Gama Profesional", desc: "Desde prototipos estéticos en PLA hasta piezas funcionales cargadas con Fibra de Carbono." },
          { label: "03. VELOCIDAD", title: "Listo para usar", desc: "Piezas mecánicas funcionales listas para ser instaladas. Rapidez y calidad garantizada en cada entrega." },
        ].map((item, i) => (
          <div key={i} className="p-12 rounded-[2.5rem] border-2 border-black/10 bg-white/40 backdrop-blur-sm hover:border-black transition-all group">
            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-8">{item.label}</p>
            <h3 className="text-3xl font-black text-black mb-6 tracking-tighter uppercase">{item.title}</h3>
            <p className="text-base text-slate-700 font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* MATERIALS PREVIEW */}
      <section className="space-y-16">
        <div className="flex justify-between items-end border-b-4 border-black pb-8">
          <div>
            <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Catálogo de Materiales</h2>
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Stock disponible para entrega inmediata</p>
          </div>
          <Link prefetch={false} href="/orders/new" className="text-xs font-black text-black uppercase tracking-widest hover:opacity-50 mb-1">Ver todos →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {materials.map((m) => (
            <div key={m.id} className="bg-white/60 backdrop-blur-md border-2 border-black/10 rounded-[2.5rem] overflow-hidden hover:border-black transition-all group">
              <div className="p-10 border-b border-black/5">
                <h3 className="text-2xl font-black text-black uppercase tracking-tighter leading-none">{m.name}</h3>
                <p className="text-[9px] text-slate-400 mt-3 font-black uppercase tracking-[0.2em]">Base de Polímero</p>
              </div>
              <div className="p-10 space-y-8">
                <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3 italic">"{m.description}"</p>
                <div className="flex flex-wrap gap-3">
                  {m.colors.map((c) => (
                    <div 
                      key={c.id} 
                      className="w-8 h-8 rounded-full border-2 border-black/10 shadow-lg group-hover:scale-110 transition-transform" 
                      style={{ backgroundColor: c.hexCode }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-black rounded-[4rem] p-16 md:p-32 text-center space-y-12 relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-5xl md:text-8xl font-black text-[#FFFCDC] tracking-tighter uppercase leading-none">¿Tenés un diseño?</h2>
          <p className="text-slate-400 font-medium text-xl max-w-xl mx-auto mt-8">
            Subí tu pieza ahora y recibí una cotización personalizada en el día.
          </p>
          <div className="pt-10">
            <Link 
              prefetch={false}
              href="/orders/new" 
              className="inline-block bg-[#FFFCDC] text-black px-16 py-8 rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-black active:scale-95"
            >
              Cargar Modelo 3D
            </Link>
          </div>
        </div>
        
        {/* Background Graphic */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none select-none">
           <span className="text-[25rem] font-black tracking-tighter text-white/5">S3D</span>
        </div>
      </section>
    </div>
  );
}
