import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuoteForm from "@/components/QuoteForm";
import Link from "next/link";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      material: true,
      color: true,
    },
  });

  if (!order) {
    notFound();
  }

  const translateShipping = (method: string | null) => {
    switch (method) {
      case "local": return "Retiro en Local (CBA)";
      case "point_nv": return "Punto Retiro: Nueva Córdoba";
      case "point_ga": return "Punto Retiro: General Paz";
      case "moto": return "Envío en Moto / Uber";
      default: return "No definido";
    }
  };

  const translatePurpose = (p: string) => {
    switch (p) {
      case "aesthetic": return "Estético (Figura/Maqueta)";
      case "decorative": return "Decorativo (Uso diario)";
      case "mechanical": return "Mecánico (Resistencia)";
      default: return p;
    }
  };

  const translateLayerHeight = (type: string, val: number | null) => {
    switch (type) {
      case "fast": return "Rápido (0.28mm)";
      case "standard": return "Estándar (0.20mm)";
      case "detailed": return "Detalle (0.12mm)";
      case "manual": return `Manual (${val}mm)`;
      default: return type;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/orders" 
          className="bg-slate-200 p-2 rounded-full hover:bg-slate-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Gestionar Pedido
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. INFO CLIENTE */}
          <div className="bg-white border-4 border-slate-900 p-8 rounded-[2rem] shadow-sm">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <span className="w-4 h-1 bg-slate-900 rounded-full"></span>
               Información del Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-xl font-black text-slate-900">{order.user.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp / Tel</p>
                <p className="text-xl font-black text-slate-900">{order.user.phone || "No registrado"}</p>
              </div>
            </div>
          </div>

          {/* 2. ESPECIFICACIONES TÉCNICAS */}
          <div className="bg-slate-50 border-4 border-slate-900 p-8 rounded-[2rem] shadow-sm space-y-8">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
               <span className="w-4 h-1 bg-slate-900 rounded-full"></span>
               Especificaciones Técnicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Uso de la pieza</p>
                <p className="text-sm font-black text-slate-900 uppercase">{translatePurpose(order.purpose)}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Relleno (Infill)</p>
                <p className="text-sm font-black text-slate-900 uppercase">
                  {order.infillType === 'auto' ? 'Optimizado (Auto)' : `${order.infillPercentage}% (Manual)`}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Altura de Capa</p>
                <p className="text-sm font-black text-slate-900 uppercase">
                  {translateLayerHeight(order.layerHeightType, order.layerHeightManual)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200">
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Material / Color</p>
                {order.materialId ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-sm" style={{ backgroundColor: order.color?.hexCode }} />
                    <p className="text-sm font-black text-slate-900 uppercase">{order.material?.name} {order.color?.name}</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-200 p-3 rounded-xl">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic mb-1">✨ Pedido Especial</p>
                    <p className="text-sm font-black text-slate-900 uppercase">{order.customMaterial} • {order.customColor}</p>
                  </div>
                )}
                {/* FIX: Handle case where only color is custom */}
                {order.materialId && !order.colorId && (
                   <div className="mt-2 bg-amber-50 border-2 border-amber-200 p-3 rounded-xl">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic mb-1">✨ Color Especial</p>
                    <p className="text-sm font-black text-slate-900 uppercase">{order.customColor}</p>
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Preferencia de Entrega</p>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 uppercase">
                    📅 {order.desiredDate ? new Date(order.desiredDate).toLocaleDateString() : "Sin fecha preferida"}
                  </p>
                  {order.deliveryNotes && (
                    <p className="text-xs font-bold text-slate-500 italic">" {order.deliveryNotes} "</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. ARCHIVOS Y PAGO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border-4 border-slate-900 p-8 rounded-[2rem] space-y-4 shadow-sm">
              <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Modelo 3D</h2>
              <div className="flex items-center gap-3">
                <div className="bg-blue-700 p-2 rounded-lg text-white border-2 border-slate-900 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="font-black text-slate-900 text-base truncate" title={order.fileName}>{order.fileName}</p>
              </div>
              <a 
                href={`/api/orders/${order.id}/download`}
                className="block text-center bg-slate-900 text-white py-4 rounded-xl font-black text-xs border-2 border-slate-900 hover:bg-blue-700 transition-all uppercase tracking-widest shadow-xl shadow-blue-900/10"
              >
                DESCARGAR STL
              </a>
            </div>

            {order.receiptPath ? (
              <div className="bg-emerald-50 border-4 border-slate-900 p-8 rounded-[2rem] space-y-4 shadow-sm">
                <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Comprobante de Pago</h2>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-700 p-2 rounded-lg text-white border-2 border-slate-900 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-black text-slate-900 text-base">Recibo cargado</p>
                </div>
                <a 
                  href={`/api/orders/${order.id}/download-receipt`}
                  className="block text-center bg-slate-900 text-white py-4 rounded-xl font-black text-xs border-2 border-slate-900 hover:bg-emerald-700 transition-all uppercase tracking-widest shadow-xl shadow-emerald-900/10"
                >
                  VER COMPROBANTE
                </a>
              </div>
            ) : (
              <div className="bg-slate-50 border-4 border-dashed border-slate-300 p-8 rounded-[2rem] flex items-center justify-center">
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] italic text-center leading-relaxed">Sin comprobante<br/>de pago aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de Cotización */}
        <div className="bg-white border-4 border-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 sticky top-4">
          <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <span className="w-2.5 h-10 bg-blue-600 rounded-full"></span>
            Gestión de Cotización
          </h2>
          <QuoteForm order={order} />
        </div>
      </div>
    </div>
  );
}
