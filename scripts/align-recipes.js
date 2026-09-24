const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRecipesToMatchSheetsExact() {
  console.log('Aligning recipes directly with the user sheets...');

  // Find electricity / water material
  const elecWater = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Electricity' } },
  });

  // Find food coloring material
  const foodColoring = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Coloring' } },
  });

  // 1. Update Zaatar & Labneh Savory Cupcakes (ZLC)
  const zlcRecipe = await prisma.recipe.findUnique({
    where: { name: 'Zaatar & Labneh Savory Cupcakes' },
    include: { ingredients: true },
  });

  if (zlcRecipe) {
    // Check if electricity is already linked
    const hasElec = zlcRecipe.ingredients.some(
      (i) => i.rawMaterialId === elecWater.id
    );

    if (!hasElec) {
      await prisma.recipeIngredient.create({
        data: {
          recipeId: zlcRecipe.id,
          rawMaterialId: elecWater.id,
          quantityUsed: 18, // 18 units @ 7 TRY = 126 TRY
        },
      });
    }

    // Set overheadPercent to 0 so no confusing 31% is displayed
    await prisma.recipe.update({
      where: { id: zlcRecipe.id },
      data: {
        overheadPercent: 0.0,
        wrapCostPerSlice: 20.0, // 10 box + 10 bag
        labelCostPerSlice: 2.0, // 2 stickers @ 1
        outerBoxCost: 0.0,
      },
    });
    console.log('Updated [ZLC] Zaatar & Labneh Savory Cupcakes.');
  }

  // 2. Update Carrot Walnut Cupcake with Cream Cheese Frosting (CWC)
  const cwcRecipe = await prisma.recipe.findFirst({
    where: { skuPrefix: 'CWC' },
    include: { ingredients: true },
  });

  if (cwcRecipe) {
    // Check if electricity is already linked
    const hasElec = cwcRecipe.ingredients.some(
      (i) => i.rawMaterialId === elecWater.id
    );

    if (!hasElec) {
      await prisma.recipeIngredient.create({
        data: {
          recipeId: cwcRecipe.id,
          rawMaterialId: elecWater.id,
          quantityUsed: 15, // 15 units @ 7 TRY = 105 TRY
        },
      });
    }

    // Set overheadPercent to 0 so no confusing 39% is displayed
    // Packaging in sheet = 169.25 TRY (150 box + 14.25 paper + 5 coloring) => 169.25 / 15 = 11.28333 TRY / cupcake
    await prisma.recipe.update({
      where: { id: cwcRecipe.id },
      data: {
        overheadPercent: 0.0,
        wrapCostPerSlice: 10.95, // 10 box + 0.95 paper
        labelCostPerSlice: 0.33333, // 5 coloring / 15
        outerBoxCost: 0.0,
      },
    });
    console.log('Updated [CWC] Carrot Walnut Cupcake with Cream Cheese Frosting.');
  }
}

updateRecipesToMatchSheetsExact()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
