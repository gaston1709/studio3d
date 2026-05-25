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
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Confirmar y <span className="text-blue-600">Pagar</span></h1>

      <div className="bg-white border-4 border-slate-900 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-10">
        {/* Resumen */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-slate-100 pb-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Costo Total</p>
            <p className="text-4xl font-black text-slate-900">${order.price.toFixed(2)}</p>
          </div>
          <div className="md:text-right bg-blue-50 border-2 border-blue-100 px-6 py-4 rounded-2xl w-full md:w-auto">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1 italic flex items-center md:justify-end gap-1">
              Seña del 50%
              <svg className="w-3.5 h-3.5 text-blue-500 inline-block" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-11.795H13l1.812-7.205L6 13.795H11l-1.187 2.109z" />
              </svg>
            </p>
            <p className="text-4xl font-black text-blue-600">${depositAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Formulario de Pago y Envío */}
        <PaymentAndShippingForm orderId={order.id} depositAmount={depositAmount} email={session.user.email} />
      </div>
    </div>
  );
}
