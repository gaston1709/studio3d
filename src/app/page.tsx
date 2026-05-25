import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ThreeDPrinterSimulator from "@/components/ThreeDPrinterSimulator";
import FactoryFarmMonitor from "@/components/FactoryFarmMonitor";

export const dynamic = "force-dynamic";

// Helper to get technical ratings for materials dynamically based on name
function getMaterialRatings(name: string) {
  const normalized = name.toUpperCase();
  if (normalized.includes("PLA")) {
    return { resistencia: 65, flexibilidad: 20, estetica: 95 };
  } else if (normalized.includes("ABS")) {
    return { resistencia: 90, flexibilidad: 45, estetica: 70 };
  } else if (normalized.includes("PETG")) {
    return { resistencia: 80, flexibilidad: 40, estetica: 80 };
  } else if (normalized.includes("TPU") || normalized.includes("FLEX")) {
    return { resistencia: 70, flexibilidad: 95, estetica: 75 };
  }
  return { resistencia: 60, flexibilidad: 50, estetica: 60 };
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // If user is admin, redirect to admin dashboard directly
  if (session?.user?.role === "ADMIN") {
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
    <div className="space-y-24 sm:space-y-40 pb-20 bg-slate-100 industrial-grid">
      
      {/* HERO SECTION - TECHNICAL LAYOUT WITH 3D SIMULATOR */}
      <section className="relative pt-6 md:pt-16 min-h-[85vh] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT: VALUE PROPOSITION */}
            <div className="lg:col-span-6 flex flex-col space-y-8 text-left animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-[#FF4F00] border border-slate-800 rounded-full px-4 py-1.5 text-[10px] font-mono tracking-widest font-black uppercase w-fit shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#FF4F00] pulse-led-orange" />
                FÁBRICA DE IMPRESIÓN 3D - CÓRDOBA
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">
                FABRICAMOS <br />
                <span className="italic text-[#FF4F00]">TUS</span> PIEZAS.
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                Convertimos archivos tridimensionales en piezas reales de alta precisión. Subí tu modelo en 3D, elegí los materiales y recibilo directamente en tu puerta.
              </p>

              <div className="bg-slate-200/50 border-l-4 border-[#FF4F00] p-4 rounded-r-xl max-w-xl">
                <p className="text-xs text-slate-500 font-mono leading-relaxed uppercase tracking-wider">
                  💡 <span className="font-bold text-slate-900">PROBÁ LA IMPRESORA:</span> Arrastrá un archivo <span className="text-[#FF4F00] font-bold">.STL</span> o <span className="text-[#FF4F00] font-bold">.OBJ</span> al simulador de la derecha para ver cómo se fabrica tu diseño.
                </p>
              </div>
              
              <div className="max-w-xl">
                {!session ? (
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                    <Link 
                      href="/auth/signin" 
                      className="bg-[#FF4F00] text-white px-8 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-900/20 active:scale-95 text-center flex-grow sm:flex-grow-0"
                    >
                      Ingresar
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="bg-transparent text-slate-900 border-4 border-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95 text-center flex-grow sm:flex-grow-0"
                    >
                      Crear Cuenta
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                    <Link 
                      prefetch={false}
                      href="/orders/new" 
                      className="bg-[#FF4F00] text-white px-8 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-900/20 active:scale-95 text-center flex-grow sm:flex-grow-0"
                    >
                      Nueva Cotización
                    </Link>
                    <Link 
                      prefetch={false}
                      href="/orders" 
                      className="bg-white text-slate-900 border-4 border-slate-200 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-900 transition-all active:scale-95 text-center flex-grow sm:flex-grow-0"
                    >
                      Mis Pedidos
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: INTERACTIVE 3D SIMULATOR */}
            <div className="lg:col-span-6 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="relative">
                {/* Calibration markings on corners */}
                <div className="absolute -top-3 -left-3 text-slate-400 font-mono text-[9px] pointer-events-none select-none">[0,0,80]</div>
                <div className="absolute -top-3 -right-3 text-slate-400 font-mono text-[9px] pointer-events-none select-none">[80,0,80]</div>
                <div className="absolute -bottom-3 -left-3 text-slate-400 font-mono text-[9px] pointer-events-none select-none">[0,80,0]</div>
                <div className="absolute -bottom-3 -right-3 text-slate-400 font-mono text-[9px] pointer-events-none select-none">[80,80,0]</div>
                
                <ThreeDPrinterSimulator />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS - PUZZLE/CONSTRUCTIVE LAYOUT */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-4 border-slate-900 pb-8 mb-16">
          <div>
            <span className="text-slate-400 font-mono uppercase tracking-[0.4em] text-[10px] block mb-2">[ PROCESO DE PRODUCCIÓN ]</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Cómo lo ensamblamos</h2>
          </div>
          <p className="text-slate-500 font-medium text-sm md:max-w-xs mt-4 md:mt-0">
            Un flujo simplificado para pasar del archivo digital al producto final en tus manos.
          </p>
        </div>

        {/* Puzzle Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Planos 3D",
              subtitle: "SUBIDA DIRECTA",
              desc: "Cargás tu archivo STL u OBJ en nuestra web. El sistema analiza la geometría tridimensional en segundos."
            },
            {
              step: "02",
              title: "Materiales",
              subtitle: "CONFIGURACIÓN",
              desc: "Elegís entre distintos polímeros según tus necesidades (resistencia, flexibilidad, color o acabado)."
            },
            {
              step: "03",
              title: "Producción",
              subtitle: "IMPRESIÓN ACTIVA",
              desc: "Asignamos el archivo a nuestra granja de impresión. El cabezal funde el material capa a capa con precisión."
            },
            {
              step: "04",
              title: "Entrega",
              subtitle: "DESPACHO RÁPIDO",
              desc: "Retirás por nuestro taller en Córdoba o lo enviamos directamente a tu domicilio listo para usar."
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white border-2 border-slate-900 rounded-[2rem] p-8 flex flex-col justify-between hover:border-[#FF4F00] transition-all relative technical-corner shadow-md group"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[#FF4F00] font-black text-4xl tracking-tighter font-mono">{item.step}</span>
                  <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 group-hover:bg-[#FF4F00] group-hover:text-white transition-colors">{item.subtitle}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
              
              {/* Connector line representing interlocking parts */}
              {idx < 3 && (
                <div className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-100 border-r-2 border-t-2 border-slate-900 rotate-45 z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* LIVE BAY MONITOR - PRODUCTION AREA */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-4 border-slate-900 pb-8 mb-16">
          <div>
            <span className="text-slate-400 font-mono uppercase tracking-[0.4em] text-[10px] block mb-2">[ TELEMETRÍA AUTOMÁTICA ]</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Nuestras Impresoras</h2>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 text-white border border-slate-800 rounded-xl px-4 py-2 mt-4 md:mt-0 text-[10px] font-mono tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 pulse-led-green" />
            VISTA EN VIVO DE CAPACIDAD
          </div>
        </div>

        {/* Dynamic simulator list */}
        <FactoryFarmMonitor />
      </section>

      {/* GALLERY / CINTA TRANSPORTADORA DE TRABAJOS */}
      {carouselImages.length > 0 && (
        <section className="overflow-hidden bg-slate-900 border-y-4 border-slate-900 py-16 relative">
          <div className="container mx-auto px-6 mb-12">
            <span className="text-[#FF4F00] font-mono uppercase tracking-[0.4em] text-[10px] block mb-2">[ SALA DE EMBALAJE ]</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase leading-none">Piezas Terminadas</h2>
          </div>

          {/* Endless conveyor track wrapper */}
          <div className="w-full flex items-center relative overflow-hidden h-96">
            <div className="conveyor-track gap-8">
              {/* Double arrays to make infinite scroll effect work seamlessly */}
              {[...carouselImages, ...carouselImages].map((img, index) => (
                <div 
                  key={`${img.id}-${index}`} 
                  className="w-[280px] sm:w-[320px] bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl transition-all hover:border-[#FF4F00] flex-shrink-0"
                >
                  <div className="aspect-square bg-slate-900 relative overflow-hidden border-b border-slate-800">
                    <Image
                      src={`/uploads/carousel/${img.fileName}`}
                      alt={img.caption || "Showcase S3D"}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="320px"
                    />
                  </div>
                  {img.caption && (
                    <div className="p-5 flex-grow flex items-center justify-center bg-slate-950/80">
                      <p className="text-[11px] text-slate-400 font-mono text-center tracking-wide uppercase">
                        &quot;{img.caption}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* POLYMERS LIBRARY WITH TDS RATINGS */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-4 border-slate-900 pb-8 mb-16">
          <div>
            <span className="text-slate-400 font-mono uppercase tracking-[0.4em] text-[10px] block mb-2">[ POLÍMEROS DISPONIBLES ]</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Fichas de Materiales</h2>
          </div>
          <Link prefetch={false} href="/orders/new" className="text-xs font-black text-[#FF4F00] uppercase tracking-widest hover:opacity-50 mt-4 md:mt-0">Ver todos los materiales →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {materials.map((m) => {
            const ratings = getMaterialRatings(m.name);
            return (
              <div 
                key={m.id} 
                className="bg-white border-2 border-slate-900 rounded-[2rem] overflow-hidden hover:border-[#FF4F00] transition-all flex flex-col justify-between technical-corner shadow-md group"
              >
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{m.name}</h3>
                  <span className="text-[8px] font-mono bg-slate-900 text-[#FF4F00] rounded px-2 py-0.5 uppercase tracking-widest">
                    STOCK: OK
                  </span>
                </div>
                
                {/* Body */}
                <div className="p-6 sm:p-8 space-y-6 flex-grow flex flex-col justify-between">
                  <p className="text-xs text-slate-500 leading-relaxed italic">&quot;{m.description}&quot;</p>
                  
                  {/* Technical properties progress bars */}
                  <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    <span className="font-black text-slate-700 block mb-2">PROPIEDADES TÉCNICAS</span>
                    
                    {/* Strength */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Resistencia Mecánica</span>
                        <span className="text-slate-800 font-bold">{ratings.resistencia}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${ratings.resistencia}%` }} />
                      </div>
                    </div>

                    {/* Flexibility */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Flexibilidad</span>
                        <span className="text-slate-800 font-bold">{ratings.flexibilidad}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${ratings.flexibilidad}%` }} />
                      </div>
                    </div>

                    {/* Aesthetic */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Detalle / Estética</span>
                        <span className="text-slate-800 font-bold">{ratings.estetica}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF4F00] rounded-full" style={{ width: `${ratings.estetica}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Colores en Bobina:</span>
                    <div className="flex flex-wrap gap-2.5">
                      {m.colors.map((c) => (
                        <div 
                          key={c.id} 
                          className="w-7 h-7 rounded-full border border-slate-300 shadow-inner group-hover:scale-105 transition-transform" 
                          style={{ backgroundColor: c.hexCode }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA SECTION - BLUEPRINT TERMINAL */}
      <section className="container mx-auto px-6">
        <div className="bg-slate-900 rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-16 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl border-4 border-slate-900 border-b-8 border-b-[#FF4F00] technical-corner">
            
            {/* Background grid overlay */}
            <div className="absolute inset-0 opacity-[0.04] dark-industrial-grid pointer-events-none select-none" />

            <div className="relative z-10 space-y-6">
              <span className="text-[#FF4F00] font-mono uppercase tracking-[0.4em] text-[10px] block">[ COTIZACIÓN INSTANTÁNEA ]</span>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">¿Listo para fabricar?</h2>
              <p className="text-slate-400 font-medium text-md sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Subí tus archivos STL o OBJ en nuestro cotizador inteligente y recibí el presupuesto para tu proyecto en el día.
              </p>
              
              <div className="pt-6">
                  <Link 
                    prefetch={false}
                    href="/orders/new" 
                    className="inline-block bg-[#FF4F00] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 hover:bg-white hover:text-slate-950 transition-all shadow-2xl shadow-orange-950/40 active:scale-95 border-2 border-transparent hover:border-slate-900"
                  >
                    Nueva Cotización
                  </Link>
              </div>
            </div>
            
            {/* Corner labels */}
            <div className="absolute top-4 left-6 text-slate-700 font-mono text-[8px] pointer-events-none select-none">[SYS-TERM.v4]</div>
            <div className="absolute bottom-4 right-6 text-slate-700 font-mono text-[8px] pointer-events-none select-none">[SYS-ONLINE]</div>
        </div>
      </section>

    </div>
  );
}
