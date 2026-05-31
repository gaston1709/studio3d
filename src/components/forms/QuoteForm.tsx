"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface QuoteFormProps {
  order: {
    id: string;
    price: number | null;
    printTimeEstimated: number | null;
    estimatedDelivery: string | Date | null;
    status: string;
    trackingLink?: string | null;
    files: {
      id: string;
      fileName: string;
      materialId?: string | null;
      material?: {
        id: string;
        name: string;
      } | null;
      customMaterial?: string | null;
    }[];
  };
}

export default function QuoteForm({ order }: QuoteFormProps) {
  const [price, setPrice] = useState<string>(order.price !== null ? String(order.price) : "");
  const [hours, setHours] = useState<string>(order.printTimeEstimated !== null ? String(order.printTimeEstimated) : "");
  const [deliveryDate, setDeliveryDate] = useState(
    order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split("T")[0] : ""
  );
  const [status, setStatus] = useState(order.status);
  const [trackingLink, setTrackingLink] = useState(order.trackingLink || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Cost calculator state
  const [showCalc, setShowCalc] = useState(false);
  const [fileWeights, setFileWeights] = useState<Record<string, string>>({});
  const [calcGramRate, setCalcGramRate] = useState("30");
  const [calcHourRate, setCalcHourRate] = useState("500");
  const [specPrices, setSpecPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.machineHourRate !== undefined) setCalcHourRate(String(data.machineHourRate));
        if (data.materialPricePerGram !== undefined) setCalcGramRate(String(data.materialPricePerGram));
        if (data.materialPrices !== undefined) setSpecPrices(data.materialPrices);
      })
      .catch((err) => console.error("Error loading pricing settings:", err));
  }, []);

  const calculatedTotal =
    order.files.reduce((sum, file) => {
      const weight = parseFloat(fileWeights[file.id]) || 0;
      let rate = parseFloat(calcGramRate) || 0;
      if (file.materialId && specPrices[file.materialId] !== undefined) {
        rate = specPrices[file.materialId];
      }
      return sum + (weight * rate);
    }, 0) + ((parseFloat(hours) || 0) * (parseFloat(calcHourRate) || 0));

  const applyCalculatedPrice = () => {
    setPrice(String(Math.round(calculatedTotal)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: parseFloat(price),
          printTimeEstimated: parseFloat(hours),
          estimatedDelivery: deliveryDate ? new Date(deliveryDate).toISOString() : null,
          status,
          trackingLink: status === "SHIPPED" ? trackingLink : null,
        }),
      });

      if (res.ok) {
        router.refresh();
        alert("Pedido actualizado correctamente");
      }
    } catch {
      alert("Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "mono block text-[9px] text-[var(--ink-soft)] mb-2 uppercase tracking-[0.28em]";
  const inputClass = "w-full px-4 py-3 border border-[var(--paper-line)] rounded-xl focus:border-[var(--amber)] outline-none text-[var(--ink)] bg-white/60 text-sm transition-colors placeholder:text-[var(--ink-soft)]/30 appearance-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Estado del Pedido</label>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass + " cursor-pointer pr-10"}
          >
            <option value="PENDING_QUOTE">Pendiente Cotizar</option>
            <option value="QUOTED">Cotizado (Avisar al cliente)</option>
            <option value="PAYMENT_PENDING_VERIFICATION">Pago en Verificación</option>
            <option value="ACCEPTED">Aceptado / Confirmar Fecha</option>
            <option value="PRINTING">En Impresión</option>
            <option value="FINISHED">Finalizado (Listo para retirar/coordinar)</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Recibido / Entregado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ink-soft)]">
            ▼
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Precio ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className={labelClass}>Horas Est.</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className={inputClass}
            placeholder="0.0"
          />
        </div>
      </div>

      <div className={`p-6 rounded-2xl border transition-all ${status === 'ACCEPTED' ? 'bg-[color-mix(in_srgb,var(--amber)_8%,white)] border-[var(--amber)]' : 'bg-white/40 border-[var(--paper-line)] opacity-70'}`}>
        <label className={labelClass}>
          {status === 'ACCEPTED' ? '📅 Fecha Final Confirmada' : '📅 Fecha Tentativa'}
        </label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className={inputClass}
        />
        {status !== 'ACCEPTED' && (
          <p className="mono text-[8px] text-[var(--ink-soft)] mt-2 uppercase tracking-wide">
            * Se recomienda confirmar la fecha definitiva al pasar a &quot;Aceptado&quot;.
          </p>
        )}
      </div>

      {status === "SHIPPED" && (
        <div className="p-6 rounded-2xl border border-[var(--paper-line)] bg-[color-mix(in_srgb,var(--amber)_5%,white)] transition-all">
          <label className="mono block text-[9px] text-[var(--amber)] mb-2 uppercase tracking-[0.28em]">
            🔗 Enlace de Seguimiento (Uber, Cabify, Correo, etc.)
          </label>
          <input
            type="url"
            value={trackingLink}
            onChange={(e) => setTrackingLink(e.target.value)}
            className={inputClass}
            placeholder="https://..."
            required={status === "SHIPPED"}
          />
        </div>
      )}

      {/* Calculadora de Cotización */}
      <div className="p-5 rounded-2xl border border-[var(--paper-line)] bg-white/40 space-y-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowCalc(!showCalc)}>
          <h3 className="mono text-[9px] text-[var(--ink-soft)] uppercase tracking-[0.25em] flex items-center gap-2 select-none">
            <span className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full animate-pulse"></span>
            Calculadora de Costos
          </h3>
          <span className="text-xs text-[var(--ink-soft)] select-none">{showCalc ? "▲" : "▼"}</span>
        </div>

        {showCalc && (
          <div className="space-y-4 pt-2 border-t border-[var(--paper-line)]">
            
            {/* List of files with weight inputs */}
            <div className="space-y-3">
              <label className={labelClass}>Peso por Pieza (gramos)</label>
              {order.files.length === 0 ? (
                <p className="text-[10px] text-[var(--ink-soft)] italic">No hay archivos en este pedido.</p>
              ) : (
                order.files.map((file) => {
                  let rate = parseFloat(calcGramRate) || 0;
                  let isCustomRate = false;
                  if (file.materialId && specPrices[file.materialId] !== undefined) {
                    rate = specPrices[file.materialId];
                    isCustomRate = true;
                  }

                  return (
                    <div key={file.id} className="bg-white/60 p-3 rounded-xl border border-[var(--paper-line)] space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-[10px] text-[var(--ink)] truncate max-w-[150px]" title={file.fileName}>
                          {file.fileName}
                        </span>
                        <span className="mono text-[7px] uppercase tracking-wider text-[var(--amber)] shrink-0 font-bold">
                          {file.material?.name || file.customMaterial || "Especial"} (${rate}/g{isCustomRate ? "" : " base"})
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          step="any"
                          placeholder="Gramos (ej: 45)"
                          value={fileWeights[file.id] || ""}
                          onChange={(e) => setFileWeights({
                            ...fileWeights,
                            [file.id]: e.target.value
                          })}
                          className={inputClass + " py-1.5 text-xs pr-8"}
                        />
                        <span className="absolute right-3 mono text-[9px] text-[var(--ink-soft)]/50 pointer-events-none">g</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tiempo (horas)</label>
                <input
                  type="number"
                  step="any"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={inputClass}
                  placeholder="Ej: 4.5"
                />
              </div>
              <div>
                <label className={labelClass}>$/h Máquina</label>
                <input
                  type="number"
                  step="any"
                  value={calcHourRate}
                  onChange={(e) => setCalcHourRate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1">
              <div>
                <label className={labelClass}>$/g Material Base</label>
                <input
                  type="number"
                  step="any"
                  value={calcGramRate}
                  onChange={(e) => setCalcGramRate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-between items-center bg-[var(--paper)] p-3 rounded-xl border border-[var(--paper-line)] mt-2">
              <div>
                <p className="mono text-[7px] text-[var(--ink-soft)] uppercase tracking-wider">Total Estimado</p>
                <p className="text-sm font-bold text-[var(--ink)]">${calculatedTotal.toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={applyCalculatedPrice}
                className="bg-[var(--graphite)] text-white hover:bg-[var(--amber)] hover:text-[var(--graphite)] px-3 py-1.5 rounded-lg mono text-[8px] uppercase tracking-wider font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Aplicar Precio
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Actualizar Pedido"}
      </button>

      {order.status !== "CANCELLED" && (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={async () => {
            const paidStatuses = [
              "PAYMENT_PENDING_VERIFICATION",
              "ACCEPTED",
              "PRINTING",
              "FINISHED",
              "SHIPPED",
              "DELIVERED"
            ];
            const isPaid = paidStatuses.includes(order.status);
            const message = isPaid
              ? `⚠️ ¡Atención! Este pedido ya cuenta con una seña registrada/en verificación (Estado: ${order.status}). Si lo cancelas, recordá que NO hay devolución de dinero.\n\n¿Estás seguro de que deseas cancelar este pedido?`
              : "¿Estás seguro de que deseas cancelar este pedido?";

            const confirmCancel = confirm(message);
            if (!confirmCancel) return;
            setIsSubmitting(true);
            try {
              const res = await fetch(`/api/orders/${order.id}/cancel`, {
                method: "POST",
              });
              if (res.ok) {
                alert("Pedido cancelado correctamente.");
                router.refresh();
              } else {
                const data = await res.json();
                alert(data.error || "Ocurrió un error.");
              }
            } catch {
              alert("Error de conexión.");
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="w-full py-2.5 rounded-xl font-semibold text-xs text-red-600 border border-red-200 hover:bg-red-50/50 hover:border-red-300 transition-colors active:scale-95 disabled:opacity-50 mt-2 cursor-pointer text-center"
        >
          Cancelar Pedido
        </button>
      )}
    </form>
  );
}
