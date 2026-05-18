import { prisma } from "@/lib/prisma";
import MaterialManager from "@/components/MaterialManager";

// Force this page to be dynamic so it always fetches fresh data from the DB
export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({
    include: {
      colors: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <MaterialManager initialMaterials={materials} />
  );
}
