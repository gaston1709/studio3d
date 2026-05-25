import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ThreeDPrinterSimulator from "@/components/ThreeDPrinterSimulator";
import ConveyorShowcase from "@/components/ConveyorShowcase";

export const dynamic = "force-dynamic";

// Helper to get technical ratings/labels for materials dynamically based on name
function getMaterialProperties(name: string) {
  const normalized = name.toUpperCase();
  if (normalized.includes("PLA")) {
    return { strength: "Media", flexibility: "Baja", finish: "Excelente (Fino)" };
  } else if (normalized.includes("ABS")) {
    return { strength: "Alta (Mecánica)", flexibility: "Media", finish: "Mate Industrial" };
  } else if (normalized.includes("PETG")) {
    return { strength: "Alta (Química)", flexibility: "Media-Baja", finish: "Semibrillante" };
  } else if (normalized.includes("TPU") || normalized.includes("FLEX")) {
    return { strength: "Media", flexibility: "Alta (Elástico)", finish: "Satinado" };
  }
  return { strength: "Estándar", flexibility: "Estándar", finish: "Estándar" };
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
    <div className="space-y-36 sm:space-y-48 pb-24 bg-slate-100 engineering-grid font-sans">
      
      {/* HERO SECTION - SLEEK MINIMALIST ENGINEERING LAYOUT */}
      <section className="relative pt-12 md:pt-24 min-h-[85vh] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* LEFT COLUMN: VALUE PROPOSITION */}
            <div className="lg:col-span-6 flex flex-col space-y-8 text-left animate-in fade-in slide-in-from-left-8 duration-1000">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FF4F00] font-mono">
                [ ESTUDIO DE MANUFACTURA ADITIVA ]
              </span>
              
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] uppercase">
                IMPRIMÍ <br />
                <span className="italic text-[#FF4F00]">TUS</span> PROYECTOS.
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 font-normal leading-relaxed max-w-xl">
                Convertimos planos y modelos tridimensionales en piezas físicas de alta precisión. Subí tu archivo, elegí el polímero adecuado y nosotros nos encargamos del resto.
              </p>

              {/* Designer Note */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl max-w-xl shadow-sm">
                <p className="text-xs text-slate-500 font-mono leading-relaxed uppercase tracking-wider">
                  ⚙️ <span className="font-bold text-slate-900">Visor de Malla CAD:</span> Usá la barra interactiva en el visor para inspeccionar el modelo en 3D, cortar las capas en rodajas o analizar las trayectorias de impresión (G-Code).
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                {!session ? (
                  <>
                    <Link 
                      href="/auth/signin" 
                      className="bg-[#FF4F00] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-95 text-center"
                    >
                      Ingresar
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="bg-transparent text-slate-950 border-2 border-slate-950 px-10 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all active:scale-95 text-center"
                    >
                      Crear Cuenta
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      prefetch={false}
                      href="/orders/new" 
                      className="bg-[#FF4F00] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md active:scale-95 text-center"
                    >
                      Nueva Cotización
                    </Link>
                    <Link 
                      prefetch={false}
                      href="/orders" 
                      className="bg-white text-slate-950 border-2 border-slate-200 px-10 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-950 transition-all active:scale-95 text-center"
                    >
                      Mis Pedidos
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: PURE 3D CAD VISUALIZER */}
            <div className="lg:col-span-6 flex justify-center items-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 w-full">
              <div className="w-full max-w-[500px] lg:max-w-full">
                <ThreeDPrinterSimulator />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS - CLEAN MINIMALIST CARDS */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-slate-200 pb-8 mb-16">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block mb-2 font-mono">[ PROCESO DE TRABAJO ]</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">Cómo funciona</h2>
          </div>
          <p className="text-slate-500 font-normal text-sm md:max-w-xs mt-4 md:mt-0 leading-relaxed">
            Un flujo claro y directo desde el modelado en tu computadora hasta la entrega física.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Planos 3D",
              desc: "Cargás tu archivo en formato STL u OBJ en nuestro cotizador. El sistema procesa la malla tridimensional."
            },
            {
              step: "02",
              title: "Material",
              desc: "Seleccionás el tipo de material y color que mejor se adapte a las tolerancias o estética de tu proyecto."
            },
            {
              step: "03",
              title: "Impresión",
              desc: "Iniciamos la manufactura de tu pieza en nuestra planta con parámetros de alta precisión y control de calidad."
            },
            {
              step: "04",
              title: "Entrega",
              desc: "Retirás por nuestro taller en Córdoba o coordinamos el despacho rápido directamente a tu domicilio."
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col justify-between hover:border-slate-350 transition-all shadow-sm"
            >
              <div>
                <span className="text-slate-200 font-black text-4xl tracking-tight block mb-8 font-mono">{item.step}</span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOWCASE GALLERY - CONVEYOR BELT BY SCROLL */}
      {carouselImages.length > 0 && (
        <section className="py-6">
          <div className="container mx-auto px-6 mb-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block mb-2 font-mono">[ LÍNEA DE MONTAJE ]</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">Piezas fabricadas</h2>
          </div>
          
          <ConveyorShowcase images={carouselImages} />
        </section>
      )}

      {/* POLYMERS LIBRARY - CLEAN SPEC SHEETS */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-slate-200 pb-8 mb-16">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 block mb-2 font-mono">[ BIBLIOTECA DE MATERIALES ]</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">Fichas Técnicas</h2>
          </div>
          <Link prefetch={false} href="/orders/new" className="text-xs font-black text-[#FF4F00] uppercase tracking-widest hover:opacity-50 mt-4 md:mt-0 font-mono">Ver todo →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {materials.map((m) => {
            const props = getMaterialProperties(m.name);
            return (
              <div 
                key={m.id} 
                className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:border-slate-350 transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{m.name}</h3>
                </div>
                
                <div className="p-8 space-y-8 flex-grow flex flex-col justify-between">
                  <p className="text-xs text-slate-500 leading-relaxed italic">&quot;{m.description}&quot;</p>
                  
                  {/* Flat Property List */}
                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-400">Resistencia</span>
                      <span className="text-slate-700 font-bold">{props.strength}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-400">Flexibilidad</span>
                      <span className="text-slate-700 font-bold">{props.flexibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Terminación</span>
                      <span className="text-slate-700 font-bold">{props.finish}</span>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">Colores en Bobina:</span>
                    <div className="flex flex-wrap gap-2.5">
                      {m.colors.map((c) => (
                        <div 
                          key={c.id} 
                          className="w-6 h-6 rounded-full border border-slate-200 shadow-inner" 
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

      {/* CTA SECTION - CLEAN & SPACIOUS */}
      <section className="container mx-auto px-6">
        <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-16 md:p-24 text-center space-y-8 relative overflow-hidden shadow-lg">
            
            {/* Subtle engineering grid overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-white engineering-grid pointer-events-none select-none" />

            <div className="relative z-10 space-y-6">
              <span className="text-[#FF4F00] text-xs font-black uppercase tracking-[0.2em] block font-mono">[ COTIZACIÓN AL INSTANTE ]</span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none">¿Listo para fabricar?</h2>
              <p className="text-slate-400 font-normal text-md sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Subí tus archivos STL o OBJ en nuestro cotizador y recibí el presupuesto para tu proyecto en el día.
              </p>
              
              <div className="pt-6">
                  <Link 
                    prefetch={false}
                    href="/orders/new" 
                    className="inline-block bg-[#FF4F00] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-md active:scale-95"
                  >
                    Iniciar Cotización
                  </Link>
              </div>
            </div>
        </div>
      </section>

    </div>
  );
}
