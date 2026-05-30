import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import PaymentAndShippingForm from "@/components/forms/PaymentAndShippingForm";

export default async function OrderPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  // Security check: Order must belong to the logged-in user
  if (!order || order.user.email !== session.user.email || !order.price) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="mono text-sm uppercase tracking-[0.2em] text-red-500">Pedido no válido o inaccesible.</h1>
      </div>
    );
  }

  const depositAmount = order.price / 2;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 space-y-8">
      {/* Header seam */}
      <div className="flex items-center gap-4">
        <span className="layer-seam flex-1" />
        <span className="seam-label whitespace-nowrap">— Confirmación de impresión —</span>
        <span className="layer-seam flex-1" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight">Confirmar y abonar</h1>

      <div className="bg-[var(--paper)] border border-[var(--paper-line)] rounded-2xl p-8 md:p-10 warm-shadow layer-press space-y-8">
        {/* Resumen */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[var(--paper-line)] pb-8">
          <div>
            <p className="mono text-[9px] uppercase tracking-[0.28em] text-[var(--ink-soft)] mb-1">Costo Total</p>
            <p className="text-3xl font-semibold text-[var(--ink)]">${order.price.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-[var(--paper-line)] px-6 py-4 rounded-xl w-full sm:w-auto">
            <p className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--amber)] mb-1 italic">Seña requerida (50%)</p>
            <p className="text-3xl font-semibold text-[var(--amber)]">${depositAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Formulario de Pago y Envío */}
        <PaymentAndShippingForm orderId={order.id} depositAmount={depositAmount} email={session.user.email} />
      </div>
    </div>
  );
}
