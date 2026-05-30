import { prisma } from "@/lib/prisma";
import OrderForm from "@/components/forms/OrderForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const materials = await prisma.material.findMany({
    where: { isActive: true },
    include: {
      colors: {
        where: { isActive: true }
      }
    }
  });

  return (
    <OrderForm materials={materials} />
  );
}
