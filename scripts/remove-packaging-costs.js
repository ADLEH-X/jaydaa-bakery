const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removePackagingCost() {
  console.log('Zeroing packaging costs across all recipes...');

  await prisma.recipe.updateMany({
    data: {
      wrapCostPerSlice: 0.0,
      labelCostPerSlice: 0.0,
      outerBoxCost: 0.0,
      overheadPercent: 0.0,
    },
  });

  console.log('Packaging costs removed from all recipes.');
}

removePackagingCost()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
