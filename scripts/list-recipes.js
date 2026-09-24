const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const recs = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: {
          rawMaterial: true,
        },
      },
    },
  });
  console.log(`Found ${recs.length} recipes:`);
  for (const r of recs) {
    console.log({
      id: r.id,
      name: r.name,
      skuPrefix: r.skuPrefix,
      yieldSlices: r.yieldSlices,
      overheadPercent: r.overheadPercent,
      wrapCostPerSlice: r.wrapCostPerSlice,
      labelCostPerSlice: r.labelCostPerSlice,
      outerBoxCost: r.outerBoxCost,
      ingredientsCount: r.ingredients.length,
    });
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
