"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomDialog from "@/components/ui/CustomDialog";

interface CancelOrderButtonProps {
  orderId: string;
  orderStatus: string;
}

export default function CancelOrderButton({ orderId, orderStatus }: CancelOrderButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: "alert" | "confirm" | "danger";
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "alert",
  });

  const handleCancelClick = () => {
    const paidStatuses = [
      "PAYMENT_PENDING_VERIFICATION",
      "ACCEPTED",
      "PRINTING",
      "FINISHED",
      "SHIPPED",
      "DELIVERED"
    ];
    const isPaid = paidStatuses.includes(orderStatus);

    setDialog({
      isOpen: true,
      title: isPaid ? "Cancelar Pedido Señado" : "Cancelar Pedido",
      description: isPaid
        ? "⚠️ ¡Atención! Este pedido ya cuenta con una seña en proceso de verificación o ya está en cola/producción. Al cancelarlo, NO habrá devolución del dinero.\n\n¿Estás seguro de que deseas cancelar este pedido?"
        : "¿Estás seguro de que deseas cancelar este pedido?",
      type: isPaid ? "danger" : "confirm",
      confirmText: "Sí, cancelar",
      onConfirm: executeCancel,
    });
  };

  const executeCancel = async () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    setIsPending(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        setDialog({
          isOpen: true,
          title: "Pedido Cancelado",
          description: "El pedido ha sido cancelado con éxito.",
          type: "alert",
          onConfirm: () => {
            router.refresh();
          },
        });
      } else {
        const data = await res.json();
        setDialog({
          isOpen: true,
          title: "Error al Cancelar",
          description: data.error || "Ocurrió un error al intentar cancelar.",
          type: "alert",
        });
      }
    } catch {
      setDialog({
        isOpen: true,
        title: "Error de Conexión",
        description: "Error de red al intentar comunicarse con el servidor.",
        type: "alert",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCancelClick}
        disabled={isPending}
        className="border border-red-200 text-red-600 hover:bg-red-50/50 hover:border-red-300 disabled:opacity-50 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer active:scale-95 shrink-0"
      >
        {isPending ? "Cancelando..." : "Cancelar pedido"}
      </button>

      <CustomDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        description={dialog.description}
        type={dialog.type}
        confirmText={dialog.confirmText}
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
