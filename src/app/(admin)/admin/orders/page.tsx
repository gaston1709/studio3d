import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      files: {
        include: {
          material: true,
          color: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_QUOTE":
        return "bg-white border-[var(--paper-line)] text-[var(--ink-soft)]";
      case "QUOTED":
        return "bg-white border-[var(--ink)] text-[var(--ink)]";
      case "PAYMENT_PENDING_VERIFICATION":
        return "bg-[color-mix(in_srgb,var(--amber)_8%,white)] border-[var(--amber)] text-[var(--ink)]";
      case "ACCEPTED":
        return "bg-[var(--graphite)] border-transparent text-white";
      case "PRINTING":
        return "bg-[var(--amber)] border-transparent text-[var(--graphite)] animate-pulse";
      case "FINISHED":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "SHIPPED":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "DELIVERED":
        return "bg-emerald-100 border-transparent text-emerald-800";
      case "CANCELLED":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-[var(--paper)] border-[var(--paper-line)] text-[var(--ink-soft)]";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "PENDING_QUOTE":
        return "Análisis";
      case "QUOTED":
        return "Cotizado";
      case "PAYMENT_PENDING_VERIFICATION":
        return "Verificando Pago";
      case "ACCEPTED":
        return "En Cola";
      case "PRINTING":
        return "Imprimiendo";
      case "FINISHED":
        return "Listo p/ Retiro";
      case "SHIPPED":
        return "Enviado";
      case "DELIVERED":
        return "Entregado";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-[var(--paper-line)] gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">Log de Producción</h1>
          <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mt-2">Sistema de Gestión de Activos</p>
        </div>
        <div className="bg-white/80 border border-[var(--paper-line)] px-6 py-3 rounded-2xl text-right shadow-sm font-mono">
          <p className="text-[9px] text-[var(--ink-soft)] uppercase tracking-widest leading-none mb-1">Total Registros</p>
          <p className="text-2xl font-semibold text-[var(--ink)] leading-none">{orders.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-8 px-8">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.25em]">
              <th className="pb-2 px-6">Registro</th>
              <th className="pb-2 px-6">Usuario / Cliente</th>
              <th className="pb-2 px-6">Configuración</th>
              <th className="pb-2 px-6">Estado</th>
              <th className="pb-2 px-6 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-24 text-center bg-white/40 border border-dashed border-[var(--paper-line)] rounded-3xl">
                  <p className="mono text-xs text-[var(--ink-soft)] uppercase tracking-[0.3em] italic">Cero registros encontrados</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const firstFile = order.files[0];
                const totalFiles = order.files.length;
                const firstFileName = firstFile?.fileName || "Sin archivo";

                // Resolve Material and Color dynamically
                const materialsList = order.files.map(f => f.material?.name || f.customMaterial).filter(Boolean);
                const uniqueMaterials = Array.from(new Set(materialsList));
                const isMultiMaterial = uniqueMaterials.length > 1;

                return (
                  <tr key={order.id} className="group transition-transform duration-200">
                    <td className="py-5 px-6 bg-white/60 border-y border-l border-[var(--paper-line)] rounded-l-2xl shadow-sm">
                      <p className="mono text-[8px] text-[var(--ink-soft)] mb-1 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm font-semibold text-[var(--ink)] truncate max-w-[180px]" title={firstFileName}>
                        {firstFileName}
                      </p>
                      {totalFiles > 1 && (
                        <p className="mono text-[8px] text-[var(--amber)] uppercase tracking-wider mt-1">
                          + {totalFiles - 1} archivo(s)
                        </p>
                      )}
                    </td>
                    <td className="py-5 px-6 bg-white/60 border-y border-[var(--paper-line)] shadow-sm">
                      <p className="text-xs font-semibold text-[var(--ink)]">{order.user.email}</p>
                      <p className="mono text-[9px] text-[var(--ink-soft)] tracking-wider mt-1">{order.user.phone || "---"}</p>
                    </td>
                    <td className="py-5 px-6 bg-white/60 border-y border-[var(--paper-line)] shadow-sm">
                      {isMultiMaterial ? (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full animate-pulse"></span>
                          <span className="mono text-[9px] text-[var(--ink)] uppercase tracking-widest italic font-bold">
                            Varios
                          </span>
                        </div>
                      ) : firstFile?.materialId ? (
                        <div className="flex items-center gap-3">
                          {firstFile.color?.hexCode && (
                            <div 
                              className="w-3.5 h-3.5 rounded-full border border-[var(--paper-line)] shadow-inner" 
                              style={{ backgroundColor: firstFile.color.hexCode }}
                            />
                          )}
                          <span className="mono text-[9px] text-[var(--ink)] uppercase tracking-widest">
                            {firstFile.material?.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full animate-pulse"></span>
                          <span className="mono text-[9px] text-[var(--amber)] uppercase tracking-widest italic font-bold">
                            {firstFile?.customMaterial || "Especial"}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-6 bg-white/60 border-y border-[var(--paper-line)] shadow-sm">
                      <span className={`mono text-[8px] px-2.5 py-1 rounded-lg border uppercase tracking-[0.15em] font-medium shadow-sm inline-block ${getStatusColor(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </td>
                    <td className="py-5 px-6 bg-white/60 border-y border-r border-[var(--paper-line)] rounded-r-2xl shadow-sm text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-block bg-[var(--graphite)] text-white hover:bg-[var(--amber)] hover:text-[var(--graphite)] px-4 py-2 rounded-xl mono text-[9px] uppercase tracking-wider transition-all font-semibold active:scale-95 shadow-md"
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
