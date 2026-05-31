import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrderRatingForm from "@/components/forms/OrderRatingForm";
import CancelOrderButton from "@/components/forms/CancelOrderButton";

export const dynamic = "force-dynamic";

function PrintBedStatus({ status, hexColor }: { status: string; hexColor?: string | null }) {
  const color = hexColor ?? "var(--amber)";

  if (status === "PRINTING") {
    return (
      <div className="relative w-4 h-full min-h-[80px] rounded-sm overflow-hidden bg-[var(--graphite-line)] flex-shrink-0">
        {/* Filling layers */}
        <div
          className="absolute bottom-0 left-0 w-full rounded-sm"
          style={{
            backgroundColor: color,
            animation: "print-bed-layer 2s linear infinite",
            opacity: 0.85,
          }}
        />
        {/* Nozzle dot */}
        <div
          className="absolute left-0 w-full h-1 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 6px 2px ${color}`,
            animation: "nozzle-travel 2s linear infinite",
          }}
        />
        <style>{`
          @keyframes print-bed-layer {
            0%   { height: 0%; }
            100% { height: 85%; }
          }
          @keyframes nozzle-travel {
            0%   { bottom: 0%; }
            100% { bottom: 85%; }
          }
        `}</style>
      </div>
    );
  }

  const tempMap: Record<string, string> = {
    PENDING_QUOTE: "var(--temp-cold)",
    QUOTED: "var(--amber)",
    PAYMENT_PENDING_VERIFICATION: "var(--amber)",
    ACCEPTED: "var(--amber)",
    FINISHED: "var(--temp-done)",
    SHIPPED: "var(--temp-done)",
    DELIVERED: "var(--temp-done)",
    CANCELLED: "var(--ink-soft)",
  };

  const barColor = hexColor ?? tempMap[status] ?? "var(--amber)";
  const opacity = status === "CANCELLED" ? 0.3 : status === "PENDING_QUOTE" ? 0.4 : 1;

  return (
    <div
      className="w-2 flex-shrink-0 rounded-full self-stretch"
      style={{
        backgroundColor: barColor,
        opacity,
        animation: status === "PENDING_QUOTE" ? "pending-pulse 3s ease-in-out infinite" : undefined,
      }}
    >
      <style>{`@keyframes pending-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }`}</style>
    </div>
  );
}

const translateStatus = (status: string) => {
  switch (status) {
    case "PENDING_QUOTE": return "En análisis";
    case "QUOTED": return "Cotizado";
    case "PAYMENT_PENDING_VERIFICATION": return "Pago en proceso";
    case "ACCEPTED": return "En cola";
    case "PRINTING": return "Imprimiendo";
    case "FINISHED": return "Listo para retirar";
    case "SHIPPED": return "Enviado";
    case "DELIVERED": return "Entregado";
    case "CANCELLED": return "Cancelado";
    default: return status;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "PRINTING": return "color-mix(in srgb, var(--amber) 15%, white)";
    case "QUOTED":
    case "PAYMENT_PENDING_VERIFICATION": return "color-mix(in srgb, var(--amber) 8%, white)";
    case "ACCEPTED": return "color-mix(in srgb, var(--amber) 5%, white)";
    case "FINISHED":
    case "SHIPPED": return "color-mix(in srgb, var(--temp-done) 10%, white)";
    case "DELIVERED": return "color-mix(in srgb, var(--temp-done) 8%, white)";
    case "PENDING_QUOTE": return "color-mix(in srgb, var(--temp-cold) 8%, white)";
    case "CANCELLED": return "color-mix(in srgb, var(--ink-soft) 5%, white)";
    default: return "white";
  }
};

const getStatusTextColor = (status: string): string => {
  switch (status) {
    case "PRINTING": return "var(--amber)";
    case "QUOTED":
    case "PAYMENT_PENDING_VERIFICATION": return "var(--amber)";
    case "ACCEPTED": return "color-mix(in srgb, var(--amber) 70%, var(--ink))";
    case "FINISHED":
    case "SHIPPED":
    case "DELIVERED": return "var(--temp-done)";
    case "PENDING_QUOTE": return "var(--temp-cold)";
    case "CANCELLED": return "var(--ink-soft)";
    default: return "var(--ink)";
  }
};

const getDeliveryRange = (date: Date | null, status: string) => {
  if (!date) return <span className="mono text-[10px] text-[var(--ink-soft)] italic">Pendiente...</span>;
  const d = new Date(date);
  const prev = new Date(date);
  prev.setDate(d.getDate() - 1);
  const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
  const range = `${prev.toLocaleDateString("es-ES", options)} — ${d.toLocaleDateString("es-ES", options)}`;
  const isConfirmed = ["ACCEPTED", "PRINTING", "FINISHED", "SHIPPED", "DELIVERED"].includes(status);
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-[var(--ink)]">{range}</span>
      <span className={`mono text-[8px] uppercase tracking-widest mt-1 ${isConfirmed ? "text-[var(--amber)]" : "text-[var(--temp-cold)]"}`}>
        {isConfirmed ? "● Confirmada" : "○ Tentativa"}
      </span>
    </div>
  );
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const email = session.user.email;

  const orders = await prisma.order.findMany({
    where: { user: { email } },
    include: {
      files: {
        include: { material: true, color: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="full-bleed -mt-8 md:-mt-12 -mb-8 md:-mb-12">
      {/* Header */}
      <div className="panel-paper">
        <div className="container mx-auto px-6 pt-10 flex items-center gap-4">
          <span className="layer-seam flex-1" />
          <span className="seam-label whitespace-nowrap">— Historial de impresión —</span>
          <span className="layer-seam flex-1" />
        </div>
        <div className="container mx-auto px-6 pt-8 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight">Mis pedidos</h1>
            <p className="mono text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mt-2">{email}</p>
          </div>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 bg-[var(--amber)] text-[var(--graphite)] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95"
          >
            + Nueva pieza
          </Link>
        </div>
      </div>

      {/* Orders list */}
      <div className="panel-paper">
        <div className="container mx-auto px-6 pb-24 space-y-4">
          {orders.length === 0 ? (
            /* Empty state — print bed vacía */
            <div className="py-24 flex flex-col items-center gap-8">
              {/* Print bed grid */}
              <div
                className="w-48 h-32 rounded-xl border border-[var(--paper-line)] relative overflow-hidden"
                style={{
                  background: `
                    linear-gradient(var(--paper-line) 1px, transparent 1px),
                    linear-gradient(90deg, var(--paper-line) 1px, transparent 1px),
                    var(--paper)
                  `,
                  backgroundSize: "24px 24px",
                  animation: "bed-warm 4s ease-in-out infinite",
                }}
              >
                <style>{`@keyframes bed-warm { 0%,100%{background-color:var(--paper)} 50%{background-color:color-mix(in srgb, var(--amber) 5%, var(--paper))} }`}</style>
              </div>
              <div className="text-center space-y-2">
                <p className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)]">Cama vacía.</p>
                <p className="text-[var(--ink-soft)]">Todavía no imprimimos nada tuyo.</p>
              </div>
              <Link
                href="/orders/new"
                className="bg-[var(--amber)] text-[var(--graphite)] px-8 py-4 rounded-xl font-semibold hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95"
              >
                Mandanos tu primer archivo →
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const displayFileName =
                order.files.length > 0
                  ? order.files.length > 1
                    ? `${order.files[0].fileName} (+${order.files.length - 1})`
                    : order.files[0].fileName
                  : "Sin archivo";

              const fileMaterials = order.files.map(f => f.material?.name || f.customMaterial).filter((m): m is string => !!m);
              const uniqueMaterials = Array.from(new Set(fileMaterials));
              const displayMaterial = uniqueMaterials.length === 1 ? uniqueMaterials[0] : uniqueMaterials.length > 1 ? "Varios" : "Especial";

              const fileColors = order.files.map(f => f.color || (f.customColor ? { name: f.customColor, hexCode: null } : null)).filter((c): c is NonNullable<typeof c> => !!c);
              const uniqueColorNames = Array.from(new Set(fileColors.map(c => c.name)));
              const isSingleColor = uniqueColorNames.length === 1;
              const displayColor = isSingleColor ? uniqueColorNames[0] : uniqueColorNames.length > 1 ? "Varios" : "Especial";
              const colorObject = isSingleColor ? fileColors[0] : null;
              const hexColor = colorObject && "hexCode" in colorObject ? colorObject.hexCode : null;

              const isPrinting = order.status === "PRINTING";
              const bgColor = getStatusColor(order.status);
              const statusTextColor = getStatusTextColor(order.status);

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border border-[var(--paper-line)] overflow-hidden perimeter-card ${isPrinting ? "warm-shadow" : ""}`}
                  style={{ backgroundColor: bgColor, opacity: order.status === "CANCELLED" ? 0.7 : 1 }}
                >
                  <div className="flex gap-0">
                    {/* Left: print bed status indicator */}
                    <div className="p-4 pr-0 flex items-stretch">
                      <PrintBedStatus status={order.status} hexColor={hexColor} />
                    </div>

                    {/* Main card content */}
                    <div className="flex-1 p-5 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start lg:items-center">
                        {/* File info */}
                        <div className="lg:col-span-5 space-y-3">
                          <p className="text-base sm:text-lg font-semibold text-[var(--ink)] truncate" title={displayFileName}>
                            {displayFileName}
                          </p>
                          <div className="flex flex-wrap gap-4">
                            <div>
                              <span className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-[0.3em] block mb-1">Material</span>
                              <p className="text-xs font-medium text-[var(--ink)]">{displayMaterial}</p>
                            </div>
                            <div>
                              <span className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-[0.3em] block mb-1">Color</span>
                              <div className="flex items-center gap-2">
                                {hexColor && (
                                  <div
                                    className="w-3 h-3 rounded-full border border-[var(--paper-line)] flex-shrink-0"
                                    style={{
                                      background: `conic-gradient(
                                        color-mix(in srgb, ${hexColor} 80%, black) 0deg,
                                        ${hexColor} 90deg,
                                        color-mix(in srgb, ${hexColor} 90%, white) 180deg,
                                        ${hexColor} 270deg,
                                        color-mix(in srgb, ${hexColor} 80%, black) 360deg
                                      )`,
                                    }}
                                  />
                                )}
                                <p className="text-xs font-medium text-[var(--ink)]">{displayColor}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delivery */}
                        <div className="lg:col-span-3">
                          <span className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-[0.3em] block mb-1.5">Entrega</span>
                          {order.status === "PENDING_QUOTE" ? (
                            <span className="mono text-[10px] text-[var(--ink-soft)] italic">En análisis...</span>
                          ) : (
                            getDeliveryRange(order.estimatedDelivery, order.status)
                          )}
                        </div>

                        {/* Status & price */}
                        <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg mono text-[9px] uppercase tracking-[0.2em] border"
                            style={{
                              color: statusTextColor,
                              borderColor: `color-mix(in srgb, ${statusTextColor} 30%, transparent)`,
                              backgroundColor: `color-mix(in srgb, ${statusTextColor} 8%, transparent)`,
                            }}
                          >
                            {isPrinting && (
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusTextColor }} />
                            )}
                            {translateStatus(order.status)}
                          </span>

                          <div className="flex flex-wrap gap-2 items-center justify-start lg:justify-end mt-2">
                            {order.status === "QUOTED" && (
                              <Link
                                href={`/orders/${order.id}/pay`}
                                className="bg-[var(--amber)] text-[var(--graphite)] px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 whitespace-nowrap"
                              >
                                Confirmar pedido
                              </Link>
                            )}

                            {["PENDING_QUOTE", "QUOTED", "PAYMENT_PENDING_VERIFICATION", "ACCEPTED"].includes(order.status) && (
                              <CancelOrderButton orderId={order.id} orderStatus={order.status} />
                            )}
                          </div>

                          {order.price && order.status !== "QUOTED" && (
                            <div className="text-left lg:text-right mt-1">
                              <span className="mono text-[8px] text-[var(--ink-soft)] uppercase tracking-[0.3em] block mb-0.5">Total</span>
                              <p className="text-xl font-semibold text-[var(--ink)]">${order.price.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tracking & Ratings */}
                      {((order.status === "SHIPPED" && order.trackingLink) || order.status === "DELIVERED") && (
                        <div className="mt-5 pt-5 border-t border-[var(--paper-line)] flex flex-col gap-5">
                          {order.status === "SHIPPED" && order.trackingLink && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[color-mix(in_srgb,var(--temp-done)_30%,var(--paper-line))] bg-[color-mix(in_srgb,var(--temp-done)_5%,white)]">
                              <div>
                                <p className="text-sm font-medium text-[var(--ink)]">Tu pedido está en camino</p>
                                <p className="mono text-[10px] text-[var(--ink-soft)] mt-0.5 uppercase tracking-[0.2em]">Seguí el envío en tiempo real</p>
                              </div>
                              <a
                                href={order.trackingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[var(--amber)] text-[var(--graphite)] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 shrink-0 inline-flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.485V6.877a2 2 0 011.236-1.87l6-2.5a2 2 0 011.528 0l6 2.5a2 2 0 011.236 1.87v8.608a2 2 0 01-1.236 1.87L13 20a2 2 0 01-1.528 0L9 20z" />
                                </svg>
                                Seguir envío
                              </a>
                            </div>
                          )}

                          {order.status === "DELIVERED" && (
                            <div>
                              {order.rating !== null ? (
                                <div className="p-4 rounded-xl border border-[var(--paper-line)] bg-[color-mix(in_srgb,var(--temp-done)_5%,white)]">
                                  <p className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.28em] mb-3">Tu opinión</p>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                        fill={star <= (order.rating ?? 0) ? "var(--amber)" : "none"}
                                        stroke="var(--amber)" strokeWidth={1.5} className="w-4 h-4"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.15-.343.64-.343.79 0l2.3 4.658 5.137.747c.379.055.53.518.256.787l-3.717 3.623.878 5.117c.064.375-.329.66-.668.48l-4.594-2.414-4.594 2.414c-.339.18-.732-.105-.668-.48l.878-5.117L3.1 10.428c-.275-.269-.123-.732.257-.787l5.137-.747 2.3-4.658z" />
                                      </svg>
                                    ))}
                                  </div>
                                  {order.ratingComment && (
                                    <p className="text-sm text-[var(--ink-soft)] italic">&quot;{order.ratingComment}&quot;</p>
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
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
