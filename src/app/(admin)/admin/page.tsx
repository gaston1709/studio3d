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
    { label: "Cotización Pendiente", count: getCount("PENDING_QUOTE"), statusColor: "bg-[var(--amber)]", link: "/admin/orders" },
    { label: "En Cola de Espera", count: getCount("ACCEPTED"), statusColor: "bg-[var(--ink-soft)]", link: "/admin/queue" },
    { label: "Manufacturando", count: getCount("PRINTING"), statusColor: "bg-[var(--amber)] animate-pulse", link: "/admin/queue" },
    { label: "Listos p/ Retiro", count: getCount("FINISHED"), statusColor: "bg-emerald-600", link: "/admin/orders" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <span className="layer-seam flex-1" />
          <span className="seam-label whitespace-nowrap">— OPERACIONES DE MANUFACTURA —</span>
          <span className="layer-seam flex-1" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">Consola de Control</h1>
        <p className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.28em] mt-1.5">Monitoreo y administración del taller 3D</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Link
            key={i}
            href={card.link}
            className="panel-paper p-8 rounded-2xl border border-[var(--paper-line)] warm-shadow flex flex-col justify-between hover:border-[var(--amber)] hover:bg-[color-mix(in_srgb,var(--amber)_3%,white)] transition-all group layer-press"
          >
            <p className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.2em] mb-4 group-hover:text-[var(--ink)] transition-colors">
              {card.label}
            </p>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-semibold tracking-tight text-[var(--ink)]">
                {card.count}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${card.statusColor}`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Orders Card */}
        <Link
          href="/admin/orders"
          className="p-10 bg-[var(--graphite)] text-[var(--paper)] rounded-3xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] hover:border-[var(--amber)] border border-transparent transition-all shadow-lg shadow-black/15 group"
        >
          <div className="space-y-3">
            <span className="mono text-[9px] text-[var(--paper)]/50 uppercase tracking-[0.25em]">MÓDULO DE VENTAS</span>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Gestión de Órdenes</h2>
            <p className="text-[var(--paper)]/60 text-sm leading-relaxed max-w-sm">Revisión técnica de piezas, cotización manual de presupuestos y gestión de estados de pago.</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-[var(--graphite-line)]">
            <span className="mono text-[10px] text-[var(--amber)] uppercase tracking-[0.28em] font-semibold">Administrar Pedidos →</span>
            <div className="w-12 h-1 bg-[var(--graphite-line)] rounded-full group-hover:bg-[var(--amber)] transition-colors"></div>
          </div>
        </Link>

        {/* Queue Card */}
        <Link
          href="/admin/queue"
          className="p-10 bg-[var(--graphite)] text-[var(--paper)] rounded-3xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] hover:border-[var(--amber)] border border-transparent transition-all shadow-lg shadow-black/15 group"
        >
          <div className="space-y-3">
            <span className="mono text-[9px] text-[var(--paper)]/50 uppercase tracking-[0.25em]">LÍNEA DE PRODUCCIÓN</span>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Cola de Impresión</h2>
            <p className="text-[var(--paper)]/60 text-sm leading-relaxed max-w-sm">Monitoreo de tareas activas de manufactura en base a tiempos de entrega pactados.</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-[var(--graphite-line)]">
            <span className="mono text-[10px] text-[var(--amber)] uppercase tracking-[0.28em] font-semibold">Ver Cola Activa →</span>
            <div className="w-12 h-1 bg-[var(--graphite-line)] rounded-full group-hover:bg-[var(--amber)] transition-colors"></div>
          </div>
        </Link>

        {/* Materials Card */}
        <Link
          href="/admin/materials"
          className="p-10 bg-white border border-[var(--paper-line)] rounded-3xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] hover:border-[var(--amber)] transition-all warm-shadow group layer-press"
        >
          <div className="space-y-3">
            <span className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.25em]">ALMACÉN</span>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">Inventario Base</h2>
            <p className="text-[var(--ink-soft)] text-sm leading-relaxed max-w-sm">Administración de tipos de filamento, colores disponibles en stock y tarifas por gramo.</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-[var(--paper-line)]">
            <span className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.28em] font-semibold group-hover:text-[var(--amber)] transition-colors">Configurar Materiales →</span>
            <div className="w-12 h-1 bg-[var(--paper-line)] rounded-full group-hover:bg-[var(--amber)] transition-colors"></div>
          </div>
        </Link>

        {/* Settings Card */}
        <Link
          href="/admin/settings"
          className="p-10 bg-white border border-[var(--paper-line)] rounded-3xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] hover:border-[var(--amber)] transition-all warm-shadow group layer-press"
        >
          <div className="space-y-3">
            <span className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.25em]">SISTEMA</span>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">Ajustes & Cuentas</h2>
            <p className="text-[var(--ink-soft)] text-sm leading-relaxed max-w-sm">Actualización de datos bancarios (CBU/Alias) y configuración de sucursales de retiro y envíos.</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-[var(--paper-line)]">
            <span className="mono text-[10px] text-[var(--ink-soft)] uppercase tracking-[0.28em] font-semibold group-hover:text-[var(--amber)] transition-colors">Modificar Parámetros →</span>
            <div className="w-12 h-1 bg-[var(--paper-line)] rounded-full group-hover:bg-[var(--amber)] transition-colors"></div>
          </div>
        </Link>
      </div>
    </div>
  );
}
