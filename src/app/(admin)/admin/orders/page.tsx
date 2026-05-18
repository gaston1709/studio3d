import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      material: true,
      color: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_QUOTE": return "bg-white text-slate-400 border-black/10";
      case "QUOTED": return "bg-white text-black border-black";
      case "ACCEPTED": return "bg-black text-[#FFFCDC] border-black";
      case "PRINTING": return "bg-emerald-500 text-white border-emerald-600";
      case "SHIPPED": return "bg-slate-100 text-slate-600 border-slate-200";
      default: return "bg-slate-50 text-slate-400 border-slate-200";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "PENDING_QUOTE": return "Análisis";
      case "QUOTED": return "Cotizado";
      case "ACCEPTED": return "En Cola";
      case "PRINTING": return "Imprimiendo";
      case "SHIPPED": return "Entregado";
      case "CANCELLED": return "Cancelado";
      default: return status;
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b-4 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Log de Producción</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4">Historial Maestro de Órdenes</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-black/10 text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Registros</p>
          <p className="text-3xl font-black text-black leading-none">{orders.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-6">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <th className="pb-2 px-8">Registro</th>
              <th className="pb-2 px-6">Usuario / Cliente</th>
              <th className="pb-2 px-6">Configuración</th>
              <th className="pb-2 px-6">Estado</th>
              <th className="pb-2 px-8 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-40 text-center bg-white/40 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-black/10">
                  <p className="text-slate-300 font-black uppercase tracking-[0.5em] italic">Cero registros encontrados</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="group hover:translate-x-2 transition-transform duration-300">
                  <td className="py-8 px-8 bg-white/80 backdrop-blur-md border-y-2 border-l-2 border-black/5 rounded-l-[2.5rem] shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-lg font-black text-black uppercase tracking-tighter truncate max-w-[200px]" title={order.fileName}>
                      {order.fileName.split(',')[0]}
                    </p>
                    {order.fileName.split(',').length > 1 && (
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">
                        + {order.fileName.split(',').length - 1} archivo(s)
                      </p>
                    )}
                  </td>
                  <td className="py-8 px-6 bg-white/80 backdrop-blur-md border-y-2 border-black/5 shadow-sm">
                    <p className="text-sm font-black text-black tracking-tight">{order.user.email}</p>
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest mt-2">{order.user.phone || "---"}</p>
                  </td>
                  <td className="py-8 px-6 bg-white/80 backdrop-blur-md border-y-2 border-black/5 shadow-sm">
                    {order.materialId ? (
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-black/10 shadow-inner" 
                          style={{ backgroundColor: order.color?.hexCode }}
                        />
                        <span className="text-[11px] font-black text-black uppercase tracking-widest">
                          {order.material?.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest italic">
                          Especial
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-8 px-6 bg-white/80 backdrop-blur-md border-y-2 border-black/5 shadow-sm">
                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-lg border-2 uppercase tracking-[0.2em] shadow-sm ${getStatusColor(order.status)}`}>
                      {translateStatus(order.status)}
                    </span>
                  </td>
                  <td className="py-8 px-8 bg-white/80 backdrop-blur-md border-y-2 border-r-2 border-black/5 rounded-r-[2.5rem] shadow-sm text-right">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="inline-block bg-black text-[#FFFCDC] px-6 py-3 rounded-xl text-[10px] font-black hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl shadow-black/10"
                    >
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
