"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuoteFormProps {
  order: {
    id: string;
    price: number | null;
    printTimeEstimated: number | null;
    estimatedDelivery: string | Date | null;
    status: string;
    trackingLink?: string | null;
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-xl font-semibold text-sm text-[var(--graphite)] bg-[var(--amber)] hover:bg-[var(--amber-glow)] transition-colors warm-interactive active:scale-95 disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Actualizar Pedido"}
      </button>
    </form>
  );
}
