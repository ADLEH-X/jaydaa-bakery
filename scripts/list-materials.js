const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mats = await prisma.rawMaterial.findMany({
    orderBy: { name: 'asc' },
  });
  console.log(`Found ${mats.length} raw materials:`);
  console.log(
    mats.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      purchaseQuantity: m.purchaseQuantity,
      purchaseUnit: m.purchaseUnit,
      purchaseCost: m.purchaseCost,
      unitCost: m.unitCost,
    }))
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
