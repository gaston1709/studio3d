import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import PaymentAndShippingForm from "@/components/PaymentAndShippingForm";

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
        <h1 className="text-2xl font-black text-slate-900 uppercase">Pedido no válido o inaccesible.</h1>
      </div>
    );
  }

  const depositAmount = order.price / 2;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Confirmar y <span className="text-blue-600">Pagar</span></h1>

      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-10">
        {/* Resumen */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-slate-100 pb-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Costo Total</p>
            <p className="text-4xl font-black text-slate-900">${order.price.toFixed(2)}</p>
          </div>
          <div className="md:text-right bg-blue-50 border-2 border-blue-100 px-6 py-4 rounded-2xl">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1 italic">Seña del 50% ✨</p>
            <p className="text-4xl font-black text-blue-600">${depositAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Formulario de Pago y Envío */}
        <PaymentAndShippingForm orderId={order.id} depositAmount={depositAmount} email={session.user.email} />
      </div>
    </div>
  );
}
