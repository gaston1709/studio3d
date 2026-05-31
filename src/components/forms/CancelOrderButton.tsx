"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CancelOrderButtonProps {
  orderId: string;
  orderStatus: string;
}

export default function CancelOrderButton({ orderId, orderStatus }: CancelOrderButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    const paidStatuses = [
      "PAYMENT_PENDING_VERIFICATION",
      "ACCEPTED",
      "PRINTING",
      "FINISHED",
      "SHIPPED",
      "DELIVERED"
    ];
    const isPaid = paidStatuses.includes(orderStatus);
    const message = isPaid
      ? "⚠️ ¡Atención! Este pedido ya cuenta con una seña en proceso de verificación o ya está en cola/producción. Si lo cancelas, NO habrá devolución del dinero.\n\n¿Estás seguro de que deseas cancelar este pedido?"
      : "¿Estás seguro de que deseas cancelar este pedido?";

    const confirmCancel = confirm(message);
    if (!confirmCancel) return;

    setIsPending(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Pedido cancelado correctamente.");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Ocurrió un error al intentar cancelar.");
      }
    } catch {
      alert("Error de conexión al intentar cancelar.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="border border-red-200 text-red-600 hover:bg-red-50/50 hover:border-red-300 disabled:opacity-50 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-95 shrink-0"
    >
      {isPending ? "Cancelando..." : "Cancelar pedido"}
    </button>
  );
}
