import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const email = session.user.email;

  const orders = await prisma.order.findMany({
    where: {
      user: {
        email: email,
      },
    },
    include: {
      files: {
        include: {
          material: true,
          color: true
        }
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const translateStatus = (status: string) => {
    switch (status) {
      case "PENDING_QUOTE": return "En Análisis";
      case "QUOTED": return "Cotizado";
      case "PAYMENT_PENDING_VERIFICATION": return "Pago en Proceso";
      case "ACCEPTED": return "En Cola";
      case "PRINTING": return "Imprimiendo";
      case "SHIPPED": return "Entregado";
      case "CANCELLED": return "Cancelado";
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PRINTING": return "bg-black text-white border-black";
      case "QUOTED": return "bg-white text-[#FF4F00] border-[#FF4F00]";
      case "SHIPPED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING_QUOTE": return "bg-white text-slate-400 border-slate-200";
      default: return "bg-white text-slate-700 border-slate-200";
    }
  };

  const getDeliveryRange = (date: Date | null, status: string) => {
    if (!date) return "Pendiente...";
    const d = new Date(date);
    const prev = new Date(date);
    prev.setDate(d.getDate() - 1);

    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const range = `${prev.toLocaleDateString('es-ES', options)} - ${d.toLocaleDateString('es-ES', options)}`;
    
    const isConfirmed = ["ACCEPTED", "PRINTING", "SHIPPED"].includes(status);
    
    return (
      <div className="flex flex-col">
        <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">{range}</span>
        <span className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isConfirmed ? 'text-emerald-500' : 'text-amber-500'}`}>
          {isConfirmed ? '● Confirmada' : '○ Tentativa'}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 bg-slate-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b-4 border-slate-900 pb-12">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Mis Pedidos</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Sesión activa: <span className="text-[#FF4F00]">{email}</span>
          </p>
        </div>
        <Link 
          href="/orders/new" 
          className="bg-[#FF4F00] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-orange-900/20 active:scale-95"
        >
          + Nuevo Pedido
        </Link>
      </div>

      <div className="space-y-8">
        {orders.length === 0 ? (
          <div className="py-40 text-center bg-white rounded-[3rem] border-2 border-slate-200 shadow-sm">
            <p className="text-slate-300 font-black uppercase tracking-[0.4em] mb-10 text-sm">Historial de manufactura vacío</p>
            <Link 
              href="/orders/new" 
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#FF4F00] transition-all"
            >
              Iniciar primer pedido
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const displayFileName = order.files && order.files.length > 0 
                ? (order.files.length > 1 ? `${order.files[0].fileName} (+${order.files.length - 1})` : order.files[0].fileName)
                : "Sin archivo";

            const fileMaterials = order.files.map(f => f.material?.name || f.customMaterial).filter((m): m is string => !!m);
            const uniqueMaterials = Array.from(new Set(fileMaterials));
            const displayPolymer = uniqueMaterials.length === 1 ? uniqueMaterials[0] : uniqueMaterials.length > 1 ? "Varios" : "Especial";

            const fileColors = order.files.map(f => f.color || (f.customColor ? { name: f.customColor, hexCode: null } : null)).filter((c): c is NonNullable<typeof c> => !!c);
            const uniqueColorNames = Array.from(new Set(fileColors.map(c => c.name)));
            const isSingleColor = uniqueColorNames.length === 1;
            const displayColor = isSingleColor ? uniqueColorNames[0] : uniqueColorNames.length > 1 ? "Varios" : "Especial";
            const colorObject = isSingleColor ? fileColors[0] : null;

            return (
              <div key={order.id} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:border-[#FF4F00] transition-all group overflow-hidden relative">
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${order.status === 'PRINTING' ? 'bg-black' : 'bg-slate-50'}`}></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-5 space-y-8">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block leading-none">Activo Digital</span>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-[#FF4F00] transition-colors truncate" title={displayFileName}>{displayFileName}</p>
                    </div>
                    
                    <div className="flex gap-16">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 block leading-none">Polímero</span>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{displayPolymer}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 block leading-none">Cromática</span>
                        <div className="flex items-center gap-3">
                          {colorObject?.hexCode && (
                            <div className="w-3 h-3 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: colorObject.hexCode }} />
                          )}
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{displayColor}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block leading-none">Ciclo de Entrega</span>
                     {order.status === 'PENDING_QUOTE' ? (
                       <p className="text-[10px] font-black text-slate-300 uppercase italic">Análisis Técnico en curso...</p>
                     ) : (
                       getDeliveryRange(order.estimatedDelivery, order.status)
                     )}
                  </div>

                  <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-8">
                    <div className="text-left lg:text-right">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 block leading-none">Estado</span>
                      <span className={`inline-block px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${getStatusStyle(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </div>

                    {order.status === 'QUOTED' && (
                      <Link 
                        href={`/orders/${order.id}/pay`}
                        className="bg-[#FF4F00] text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-orange-900/20 active:scale-95"
                      >
                        Confirmar Pedido
                      </Link>
                    )}

                    {order.price && order.status !== 'QUOTED' && (
                      <div className="text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 block leading-none">Inversión</span>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">${order.price.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
