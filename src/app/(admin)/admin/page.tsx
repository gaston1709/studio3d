import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  const getCount = (status: string) => stats.find((s) => s.status === status)?._count || 0;

  const cards = [
    { label: "Análisis Pendiente", count: getCount("PENDING_QUOTE"), color: "bg-amber-500", link: "/admin/orders" },
    { label: "En Cola", count: getCount("ACCEPTED"), color: "bg-black", link: "/admin/queue" },
    { label: "Manufacturando", count: getCount("PRINTING"), color: "bg-emerald-500", link: "/admin/queue" },
    { label: "Listos p/ Entregar", count: getCount("SHIPPED"), color: "bg-slate-300", link: "/admin/orders" },
  ];

  return (
    <div className="space-y-12">
      <div className="border-b-4 border-black pb-8">
        <h1 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Consola de <span className="opacity-30 italic">Control</span></h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4">Panel Maestro de Producción</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <Link key={i} href={card.link} className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border-2 border-black/10 shadow-sm hover:border-black transition-all group">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 group-hover:text-black">{card.label}</p>
            <div className="flex items-end justify-between">
               <p className="text-6xl font-black text-black tracking-tighter leading-none">{card.count}</p>
               <div className={`w-3 h-3 rounded-full ${card.color} animate-pulse`}></div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Link href="/admin/orders" className="p-12 bg-black rounded-[3rem] text-white flex flex-col justify-between min-h-[350px] hover:scale-[1.02] transition-all shadow-2xl shadow-black/20 group">
           <div className="space-y-4">
             <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Gestión de Órdenes</h2>
             <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">Revisión técnica y cotización de archivos</p>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Acceder al Módulo →</span>
             <div className="w-16 h-1.5 bg-white/20 rounded-full group-hover:bg-white transition-colors"></div>
           </div>
        </Link>

        <Link href="/admin/materials" className="p-12 bg-white/60 backdrop-blur-md rounded-[3rem] border-4 border-black text-black flex flex-col justify-between min-h-[350px] hover:scale-[1.02] transition-all group">
           <div className="space-y-4">
             <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Inventario Base</h2>
             <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Control de polímeros y stock de colores</p>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Acceder al Módulo →</span>
             <div className="w-16 h-1.5 bg-black/10 rounded-full group-hover:bg-black transition-colors"></div>
           </div>
        </Link>

        <Link href="/admin/users" className="p-12 bg-amber-50 rounded-[3rem] border-4 border-amber-200 text-slate-900 flex flex-col justify-between min-h-[350px] hover:scale-[1.02] transition-all group">
           <div className="space-y-4">
             <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Usuarios</h2>
             <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Gestión de permisos y terminales activas</p>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">Acceder al Módulo →</span>
             <div className="w-16 h-1.5 bg-amber-200 rounded-full group-hover:bg-amber-400 transition-colors"></div>
           </div>
        </Link>

        <Link href="/admin/carousel" className="p-12 bg-slate-900 rounded-[3rem] text-white flex flex-col justify-between min-h-[350px] hover:scale-[1.02] transition-all shadow-2xl group">
           <div className="space-y-4">
             <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Showcase Gallery</h2>
             <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">Gestor del carrusel de imágenes de la Home</p>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[10px] font-black text-[#FF4F00] uppercase tracking-[0.4em]">Acceder al Módulo →</span>
             <div className="w-16 h-1.5 bg-white/20 rounded-full group-hover:bg-[#FF4F00] transition-colors"></div>
           </div>
        </Link>

        <Link href="/admin/settings" className="p-12 bg-blue-50 rounded-[3rem] border-4 border-blue-200 text-slate-900 flex flex-col justify-between min-h-[350px] hover:scale-[1.02] transition-all group">
           <div className="space-y-4">
             <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">Datos de Pago</h2>
             <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">CBU, Alias y configuraciones globales</p>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Acceder al Módulo →</span>
             <div className="w-16 h-1.5 bg-blue-200 rounded-full group-hover:bg-blue-400 transition-colors"></div>
           </div>
        </Link>
      </div>
    </div>
  );
}
