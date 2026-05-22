import { prisma } from "@/lib/prisma";
import QueueManager from "@/components/QueueManager";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const pendingOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["ACCEPTED", "PRINTING"],
      },
    },
    include: {
      user: true,
      files: {
        include: {
          material: true,
          color: true
        }
      },
    },
    orderBy: [
      { queuePosition: "asc" },
      { createdAt: "asc" },
    ],
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Cola de Impresión</h1>
      <QueueManager initialOrders={pendingOrders} />
    </div>
  );
}
