import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrderRatingForm from "@/components/OrderRatingForm";

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
      case "FINISHED": return "Listo p/ Retirar";
      case "SHIPPED": return "Enviado";
      case "DELIVERED": return "Entregado";
      case "CANCELLED": return "Cancelado";
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PRINTING": return "bg-black text-white border-black";
      case "QUOTED": return "bg-white text-[#FF4F00] border-[#FF4F00]";
      case "PAYMENT_PENDING_VERIFICATION": return "bg-amber-50 text-amber-700 border-amber-200";
      case "ACCEPTED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "FINISHED": return "bg-orange-50 text-[#FF4F00] border-[#FF4F00]";
      case "SHIPPED": return "bg-purple-50 text-purple-700 border-purple-200";
      case "DELIVERED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING_QUOTE": return "bg-white text-slate-400 border-slate-200";
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200";
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
    
    const isConfirmed = ["ACCEPTED", "PRINTING", "FINISHED", "SHIPPED", "DELIVERED"].includes(status);
    
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
    <div className="max-w-5xl mx-auto py-6 sm:py-12 px-4 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-6 sm:gap-8 border-b-4 border-slate-900 pb-8 sm:pb-12">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Mis Pedidos</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Sesión activa: <span className="text-[#FF4F00]">{email}</span>
          </p>
        </div>
        <Link 
          href="/orders/new" 
          className="bg-[#FF4F00] text-white px-6 py-4 sm:px-10 sm:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-orange-900/20 active:scale-95 w-full md:w-auto text-center"
        >
          + Nuevo Pedido
        </Link>
      </div>

      <div className="space-y-8">
        {orders.length === 0 ? (
          <div className="py-20 sm:py-40 px-4 text-center bg-white rounded-3xl sm:rounded-[3rem] border-2 border-slate-200 shadow-sm">
            <p className="text-slate-300 font-black uppercase tracking-[0.4em] mb-8 sm:mb-10 text-sm">Historial de manufactura vacío</p>
            <Link 
              href="/orders/new" 
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#FF4F00] transition-all w-full sm:w-auto text-center"
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
              <div key={order.id} className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:border-[#FF4F00] transition-all group overflow-hidden relative">
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${order.status === 'PRINTING' ? 'bg-black' : 'bg-slate-50'}`}></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:items-center">
                  <div className="lg:col-span-5 space-y-6 sm:space-y-8 w-full min-w-0">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block leading-none">Activo Digital</span>
                      <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter group-hover:text-[#FF4F00] transition-colors truncate" title={displayFileName}>{displayFileName}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-6 sm:gap-16">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 block leading-none">Polímero</span>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{displayPolymer}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 block leading-none">Cromática</span>
                        <div className="flex items-center gap-3">
                          {colorObject?.hexCode && (
                            <div className="w-3 h-3 rounded-full border border-slate-200 shadow-inner flex-shrink-0" style={{ backgroundColor: colorObject.hexCode }} />
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

                  <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-6 sm:gap-8 w-full">
                    <div className="text-left lg:text-right">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 block leading-none">Estado</span>
                      <span className={`inline-block px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${getStatusStyle(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </div>

                    {order.status === 'QUOTED' && (
                      <Link 
                        href={`/orders/${order.id}/pay`}
                        className="bg-[#FF4F00] text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-orange-900/20 active:scale-95 w-full lg:w-auto text-center"
                      >
                        Confirmar Pedido
                      </Link>
                    )}

                    {order.price && order.status !== 'QUOTED' && (
                      <div className="text-left lg:text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 block leading-none">Inversión</span>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">${order.price.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Section: Tracking & Ratings */}
                {((order.status === "SHIPPED" && order.trackingLink) || order.status === "DELIVERED") && (
                  <div className="mt-8 pt-6 border-t-2 border-slate-100 flex flex-col gap-6">
                    {order.status === "SHIPPED" && order.trackingLink && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-orange-50/50 p-6 rounded-2xl border-2 border-orange-100">
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Tu pedido está en camino</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Seguí el viaje en tiempo real usando el link de la logística</p>
                        </div>
                        <a
                          href={order.trackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#FF4F00] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all text-center inline-flex items-center gap-2 border-2 border-slate-900 shadow-md active:scale-95 shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.485V6.877a2 2 0 011.236-1.87l6-2.5a2 2 0 011.528 0l6 2.5a2 2 0 011.236 1.87v8.608a2 2 0 01-1.236 1.87L13 20a2 2 0 01-1.528 0L9 20z" />
                          </svg>
                          Seguir Envío
                        </a>
                      </div>
                    )}

                    {order.status === "DELIVERED" && (
                      <div>
                        {order.rating !== null ? (
                          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tu Opinión Enviada</p>
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill={star <= (order.rating ?? 0) ? "#FF4F00" : "none"}
                                  stroke="#000"
                                  strokeWidth={2}
                                  className="w-5 h-5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.343.64-.343.79 0l2.3 4.658 5.137.747c.379.055.53.518.256.787l-3.717 3.623.878 5.117c.064.375-.329.66-.668.48l-4.594-2.414-4.594 2.414c-.339.18-.732-.105-.668-.48l.878-5.117L3.1 10.428c-.275-.269-.123-.732.257-.787l5.137-.747 2.3-4.658z" />
                                </svg>
                              ))}
                            </div>
                            {order.ratingComment && (
                              <p className="text-sm font-bold text-slate-600 italic bg-white p-4 rounded-xl border border-slate-100">
                                &quot;{order.ratingComment}&quot;
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="max-w-md">
                            <OrderRatingForm orderId={order.id} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
