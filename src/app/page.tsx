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

  const carouselImages = await prisma.carouselImage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-40 pb-20 bg-slate-100">
      {/* HERO SECTION - INDUSTRIAL TECH: LOGO LEFT, TEXT RIGHT */}
      <section className="relative pt-12 md:pt-24 min-h-[70vh] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* LEFT: BIG LOGO */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="relative w-72 h-72 md:w-[450px] md:h-[450px]">
                <Image 
                  src="/logo.png" 
                  alt="S3D Logo" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* RIGHT: INDUSTRIAL TECH MESSAGING */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <h1 className="text-6xl md:text-8xl xl:text-[10rem] font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">
                IMPRIMÍ <br />
                <span className="italic text-[#FF4F00]">TUS</span> IDEAS.
              </h1>
              
              <div className="max-w-xl space-y-8">
                <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
                  Manufactura aditiva de alta precisión. <br />
                  Convertimos activos digitales en piezas físicas de calidad.
                </p>

                {!session ? (
                  <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <Link 
                      href="/auth/signin" 
                      className="bg-[#FF4F00] text-white px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-orange-900/20 active:scale-95 text-center"
                    >
                      Iniciar Terminal
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="bg-transparent text-slate-900 border-4 border-slate-900 px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95 text-center"
                    >
                      Registrar Nodo
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <Link 
                      prefetch={false}
                      href="/orders/new" 
                      className="bg-[#FF4F00] text-white px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-orange-900/20 active:scale-95 text-center"
                    >
                      Nueva Cotización
                    </Link>
                    <Link 
                      prefetch={false}
                      href="/orders" 
                      className="bg-white text-slate-900 border-4 border-slate-200 px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-slate-900 transition-all active:scale-95 text-center"
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
        <div className="absolute top-0 left-0 w-full h-full -z-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
      </section>

      {/* TECHNICAL SHOWCASE CAROUSEL */}
      {carouselImages.length > 0 && (
        <section className="container mx-auto px-6">
          <div className="flex justify-between items-end border-b-4 border-slate-900 pb-8 mb-12">
            <div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Showcase</h2>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Galería de Manufactura</p>
            </div>
          </div>
          
          <div className="relative w-full group/carousel">
            <div 
              id="showcase-scroll"
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth gap-8 pb-10"
            >
              {carouselImages.map((img) => (
                <div key={img.id} className="w-[85vw] md:w-[40vw] lg:w-[28vw] flex-shrink-0 snap-center">
                  <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-slate-300 transition-all shadow-sm h-full flex flex-col">
                    <div className="aspect-square bg-slate-50 relative overflow-hidden">
                      <img
                        src={`/uploads/carousel/${img.fileName}`}
                        alt={img.caption || "Showcase"}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    {img.caption && (
                      <div className="p-8 flex-grow flex items-center justify-center border-t border-slate-50">
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed italic text-center">
                          "{img.caption}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-scroll script */}
            <script dangerouslySetInnerHTML={{ __html: `
              (function() {
                const el = document.getElementById('showcase-scroll');
                let direction = 1;
                setInterval(() => {
                  if (!el) return;
                  // Si llegamos al final, volvemos al principio suavemente
                  if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 50) {
                    el.scrollTo({ left: 0, behavior: 'smooth' });
                    return;
                  }
                  el.scrollBy({ left: el.offsetWidth * 0.4, behavior: 'smooth' });
                }, 5000);
              })();
            `}} />
          </div>
        </section>
      )}

      {/* MATERIALS PREVIEW */}
      <section className="space-y-16 container mx-auto px-6">
        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-8">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Biblioteca de Polímeros</h2>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Inventario disponible</p>
          </div>
          <Link prefetch={false} href="/orders/new" className="text-xs font-black text-[#FF4F00] uppercase tracking-widest hover:opacity-50 mb-1">Ver todos →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {materials.map((m) => (
            <div key={m.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-slate-300 transition-all group shadow-sm">
              <div className="p-10 border-b border-slate-50">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{m.name}</h3>
              </div>
              <div className="p-10 space-y-8">
                <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-5 italic">"{m.description}"</p>
                <div className="flex flex-wrap gap-3">
                  {m.colors.map((c) => (
                    <div 
                      key={c.id} 
                      className="w-8 h-8 rounded-full border-2 border-slate-200 shadow-inner group-hover:scale-110 transition-transform" 
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
      <section className="container mx-auto px-6">
        <div className="bg-slate-900 rounded-[4rem] p-16 md:p-32 text-center space-y-12 relative overflow-hidden shadow-2xl border-b-8 border-[#FF4F00]">
            <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">¿Listo para fabricar?</h2>
            <p className="text-slate-400 font-medium text-xl max-w-xl mx-auto mt-8 leading-relaxed">
                Subí tus archivos y recibí una cotización en el día.
            </p>
            <div className="pt-10">
                <Link 
                prefetch={false}
                href="/orders/new" 
                className="inline-block bg-[#FF4F00] text-white px-16 py-8 rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-orange-950/40 active:scale-95"
                >
                Nueva Cotización
                </Link>
            </div>
            </div>
            
            {/* Background Graphic */}
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[25rem] font-black tracking-tighter text-white/5">S3D</span>
            </div>
        </div>
      </section>
    </div>
  );
}
