import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuoteForm from "@/components/forms/QuoteForm";
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
      files: {
          include: {
              material: true,
              color: true
          }
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Helper to render material/color display
  const renderConfig = (item: { 
    materialId?: string | null; 
    material?: { name: string } | null; 
    color?: { name: string; hexCode: string } | null; 
    customMaterial?: string | null; 
    customColor?: string | null; 
  }) => {
    if (item.materialId) {
        return (
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-slate-900" style={{ backgroundColor: item.color?.hexCode }} />
            <p className="text-xs font-black text-slate-900 uppercase">{item.material?.name} {item.color?.name}</p>
          </div>
        );
    }
    return (
        <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">
                {item.customMaterial || 'Especial'} • {item.customColor || 'Especial'}
            </p>
        </div>
    );
  };

  const translatePurpose = (p: string) => {
    switch (p) {
      case "aesthetic": return "Estético (Figura/Maqueta)";
      case "decorative": return "Decorativo (Uso diario)";
      case "mechanical": return "Mecánico (Resistencia)";
      default: return p;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/orders" 
          className="bg-[var(--paper-line)]/50 p-2 rounded-full hover:bg-[var(--paper-line)] hover:scale-105 transition-all text-[var(--ink)] cursor-pointer inline-flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Gestionar Pedido
          </h1>
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-[var(--ink-soft)] mt-1">Análisis Técnico y Cotización</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. INFO CLIENTE */}
          <div className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] warm-shadow bg-white/40">
            <h2 className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.25em] mb-5 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full animate-pulse"></span>
               Información del Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">Email</p>
                <p className="text-base font-semibold text-[var(--ink)]">{order.user.email}</p>
              </div>
              <div>
                <p className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">WhatsApp / Tel</p>
                <p className="text-base font-semibold text-[var(--ink)]">{order.user.phone || "No registrado"}</p>
              </div>
            </div>
          </div>

          {/* SEGUIMIENTO Y CALIFICACIÓN */}
          {(order.trackingLink || order.rating !== null) && (
            <div className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] warm-shadow bg-white/40 space-y-6">
              <h2 className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.25em] mb-5 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full"></span>
                 Seguimiento y Calificación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order.trackingLink && (
                  <div>
                    <p className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">Link de Seguimiento</p>
                    <a
                      href={order.trackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--amber)] hover:underline break-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Ver Seguimiento Externo
                    </a>
                  </div>
                )}
                {order.rating !== null && (
                  <div>
                    <p className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-widest mb-1.5">Calificación del Cliente</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={star <= (order.rating ?? 0) ? "var(--amber)" : "none"}
                          stroke="var(--ink)"
                          strokeWidth={2}
                          className="w-5 h-5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.343.64-.343.79 0l2.3 4.658 5.137.747c.379.055.53.518.256.787l-3.717 3.623.878 5.117c.064.375-.329.66-.668.48l-4.594-2.414-4.594 2.414c-.339.18-.732-.105-.668-.48l.878-5.117L3.1 10.428c-.275-.269-.123-.732.257-.787l5.137-.747 2.3-4.658z" />
                        </svg>
                      ))}
                    </div>
                    {order.ratingComment && (
                      <p className="text-xs italic bg-white/50 p-3 rounded-xl border border-[var(--paper-line)] text-[var(--ink-soft)]">
                        &quot;{order.ratingComment}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. ESPECIFICACIONES TÉCNICAS */}
          <div className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] warm-shadow bg-white/40 space-y-6">
            <h2 className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.25em] flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full"></span>
               Especificaciones Técnicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 p-4 rounded-xl border border-[var(--paper-line)]">
                <p className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">Uso de la pieza</p>
                <p className="text-xs font-semibold text-[var(--ink)] uppercase">{translatePurpose(order.purpose)}</p>
              </div>
              <div className="bg-white/80 p-4 rounded-xl border border-[var(--paper-line)]">
                <p className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">Preferencia de Entrega</p>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--ink)] uppercase">
                    📅 {order.desiredDate ? new Date(order.desiredDate).toLocaleDateString() : "Sin fecha preferida"}
                  </p>
                  {order.deliveryNotes && (
                    <p className="text-[11px] text-[var(--ink-soft)] italic">&quot; {order.deliveryNotes} &quot;</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. ARCHIVOS Y PAGO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] warm-shadow bg-white/40 space-y-4">
              <h2 className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-widest">Modelos 3D ({order.files.length})</h2>
              
              <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
                {order.files.map((file, idx) => (
                  <div key={file.id} className="bg-white/80 p-4 rounded-xl border border-[var(--paper-line)] flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-[var(--graphite)] p-2 rounded-lg text-white shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="font-semibold text-[var(--ink)] text-xs truncate flex-1" title={file.fileName}>{file.fileName}</p>
                    </div>

                    <div className="border-t border-[var(--paper-line)] pt-2.5">
                      <p className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">Material & Color</p>
                      {renderConfig(file)}
                    </div>
                    
                    <div className="border-t border-[var(--paper-line)] pt-2.5 grid grid-cols-3 gap-2">
                      <div>
                        <p className="mono text-[7px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">Relleno</p>
                        <p className="text-[10px] font-semibold text-[var(--ink)] uppercase">
                          {file.infillType === 'auto' || !file.infillType ? 'Auto' : `${file.infillPercentage}%`}
                        </p>
                      </div>
                      <div>
                        <p className="mono text-[7px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">Capa</p>
                        <p className="text-[10px] font-semibold text-[var(--ink)] uppercase">
                          {file.layerHeightType === "manual" ? `${file.layerHeightManual}mm` : file.layerHeightType}
                        </p>
                      </div>
                      <div>
                        <p className="mono text-[7px] text-[var(--ink-soft)] uppercase tracking-widest mb-1">Escala</p>
                        <p className="text-[10px] font-semibold text-[var(--ink)] uppercase">
                          {file.scaleFactor || "100%"}
                        </p>
                      </div>
                    </div>

                    <a 
                      href={`/api/orders/${order.id}/download?index=${idx}`}
                      className="block text-center bg-[var(--graphite)] text-white hover:bg-[var(--amber)] hover:text-[var(--graphite)] py-2 rounded-lg mono text-[8px] uppercase tracking-wider transition-all font-semibold active:scale-95 shadow-sm"
                    >
                      Descargar Archivo
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {order.receiptPath ? (
              <div className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] warm-shadow bg-white/40 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h2 className="mono text-[10px] text-emerald-600 uppercase tracking-widest">Comprobante de Pago</h2>
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2 rounded-lg text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-emerald-800 text-sm">Recibo cargado</p>
                  </div>
                </div>
                <a 
                  href={`/api/orders/${order.id}/download-receipt`}
                  className="block text-center bg-[var(--graphite)] text-white hover:bg-[var(--amber)] hover:text-[var(--graphite)] py-3.5 rounded-xl mono text-[10px] uppercase tracking-widest transition-all font-semibold active:scale-95 shadow-md"
                >
                  Ver Comprobante
                </a>
              </div>
            ) : (
              <div className="border border-dashed border-[var(--paper-line)] bg-white/20 p-6 rounded-2xl flex items-center justify-center min-h-[160px]">
                <p className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.2em] italic text-center leading-relaxed">Sin comprobante<br/>de pago aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de Cotización */}
        <div className="panel-paper p-6 rounded-2xl border border-[var(--paper-line)] warm-shadow bg-white/40 sticky top-24">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--amber)] rounded-full"></span>
            Gestión de Cotización
          </h2>
          <QuoteForm order={order} />
        </div>
      </div>
    </div>
  );
}
