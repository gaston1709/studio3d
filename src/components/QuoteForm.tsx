"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuoteForm({ order }: { order: any }) {
  const [price, setPrice] = useState(order.price || "");
  const [hours, setHours] = useState(order.printTimeEstimated || "");
  const [deliveryDate, setDeliveryDate] = useState(
    order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split("T")[0] : ""
  );
  const [status, setStatus] = useState(order.status);
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
        }),
      });

      if (res.ok) {
        router.refresh();
        alert("Pedido actualizado correctamente");
      }
    } catch (error) {
      alert("Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estado del Pedido</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-3 border-4 border-slate-900 rounded-xl font-black text-slate-900 focus:border-blue-600 outline-none bg-slate-50 shadow-sm"
        >
          <option value="PENDING_QUOTE">Pendiente Cotizar</option>
          <option value="QUOTED">Cotizado (Avisar al cliente)</option>
          <option value="PAYMENT_PENDING_VERIFICATION">Pago en Verificación</option>
          <option value="ACCEPTED">Aceptado / Confirmar Fecha</option>
          <option value="PRINTING">En Impresión</option>
          <option value="SHIPPED">Enviado / Finalizado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 border-4 border-slate-900 rounded-xl font-black text-slate-900 focus:border-blue-600 outline-none bg-slate-50"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Horas Est.</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-4 py-3 border-4 border-slate-900 rounded-xl font-black text-slate-900 focus:border-blue-600 outline-none bg-slate-50"
            placeholder="0.0"
          />
        </div>
      </div>

      <div className={`p-6 rounded-2xl border-4 transition-all ${status === 'ACCEPTED' ? 'bg-blue-50 border-blue-600' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          {status === 'ACCEPTED' ? '📅 Fecha Final Confirmada' : '📅 Fecha Tentativa'}
        </label>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-900 rounded-xl font-black text-slate-900 focus:border-blue-600 outline-none bg-white"
        />
        {status !== 'ACCEPTED' && (
          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
            * Se recomienda confirmar la fecha definitiva al pasar a "Aceptado".
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:bg-slate-300"
      >
        {isSubmitting ? "Guardando..." : "Actualizar Pedido"}
      </button>
    </form>
  );
}
