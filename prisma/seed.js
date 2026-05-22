/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Bowser_20124422!", 10);
  
  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "gastongrasso@sie.com.ar" },
    update: {
      password: adminPassword,
      role: "ADMIN",
      name: "Gaston Grasso",
    },
    create: {
      email: "gastongrasso@sie.com.ar",
      name: "Gaston Grasso",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created/updated:", admin.email);

  // Create some Materials
  const materials = [
    { name: "PLA", description: "Termoplástico biodegradable con excelente acabado superficial, ideal para prototipado rápido y modelos estéticos." },
    { name: "PETG", description: "Equilibrio perfecto entre facilidad de impresión y resistencia mecánica. Alta resistencia al impacto y química." },
    { name: "ABS", description: "Ingeniería pura: excepcional resistencia térmica, durabilidad superior y gran capacidad de post-procesamiento mecánico." },
  ];

  for (const m of materials) {
    const material = await prisma.material.upsert({
      where: { name: m.name },
      update: {
        description: m.description
      },
      create: m,
    });
    console.log("Material created/updated:", material.name);

    // Add some Colors for each material
    const colors = [
      { name: "Negro", hexCode: "#000000" },
      { name: "Blanco", hexCode: "#FFFFFF" },
      { name: "Rojo", hexCode: "#FF0000" },
      { name: "Azul", hexCode: "#0000FF" },
    ];

    for (const c of colors) {
      await prisma.color.upsert({
        where: {
          name_materialId: {
            name: c.name,
            materialId: material.id,
          },
        },
        update: {},
        create: {
          ...c,
          materialId: material.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
