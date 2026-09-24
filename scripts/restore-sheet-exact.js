const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreExactSheetValues() {
  console.log('Restoring exact sheet values for all recipes...');

  // 1. Zaatar & Labneh Savory Cupcakes (ZLC)
  // Ingredients: 531.59 TRY (405.59 cake + 126 electricity/water)
  // Packaging: 396.00 TRY (180 box + 36 stickers + 180 bag) => 396 / 18 = 22.00 TRY/cupcake
  // Total Batch Cost: 927.59 TRY
  // Cost Per Cupcake: 51.53 TRY
  // Yield: 18
  await prisma.recipe.update({
    where: { name: 'Zaatar & Labneh Savory Cupcakes' },
    data: {
      yieldSlices: 18,
      overheadPercent: 0.0,
      wrapCostPerSlice: 20.0, // 10 box + 10 bag
      labelCostPerSlice: 2.0, // 2 stickers @ 1 TRY
      outerBoxCost: 0.0,
    },
  });

  // 2. Carrot Walnut Cupcake with Cream Cheese Frosting (CWC)
  // Ingredients: 375.46 TRY (165.94 cake + 104.53 cream + 105 electricity/water)
  // Packaging: 169.25 TRY (150 box + 14.25 paper + 5 coloring) => 169.25 / 15 = 11.28333 TRY/cupcake
  // Total Batch Cost: 544.71 TRY
  // Cost Per Cupcake: 36.31 TRY
  // Yield: 15
  const cwc = await prisma.recipe.findFirst({
    where: { skuPrefix: 'CWC' },
  });

  if (cwc) {
    await prisma.recipe.update({
      where: { id: cwc.id },
      data: {
        yieldSlices: 15,
        overheadPercent: 0.0,
        wrapCostPerSlice: 10.95, // 10.00 box + 0.95 paper liner
        labelCostPerSlice: 0.33333, // 5.00 food coloring / 15
        outerBoxCost: 0.0,
      },
    });
  }

  console.log('Both recipes restored to exact spreadsheet values.');
}

restoreExactSheetValues()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
