import { PrismaClient } from '@prisma/client';
import { calculateRecipeCost } from '../src/lib/calculations';

const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: { include: { rawMaterial: true } } },
  });

  for (const r of recipes) {
    console.log(`\n========================================`);
    console.log(`Recipe: ${r.name} [${r.skuPrefix}]`);
    console.log(`Yield: ${r.yieldSlices} cupcakes`);
    console.log(`----------------------------------------`);

    const breakdown = calculateRecipeCost(
      r.ingredients.map((i) => ({
        unitCost: i.rawMaterial.unitCost,
        quantityUsed: i.quantityUsed,
      })),
      r.yieldSlices,
      r.overheadPercent,
      r.wrapCostPerSlice,
      r.labelCostPerSlice,
      r.outerBoxCost
    );

    console.log(`Raw Cake Ingredients Cost: ${breakdown.rawIngredientsCost} TRY (Sheet: 405.59 TRY)`);
    console.log(`Overhead (Electricity/Water): ${breakdown.overheadBufferCost} TRY (Sheet: 126.00 TRY)`);
    console.log(`Packaging Total:           ${breakdown.slicePackagingTotal} TRY (Sheet: 396.00 TRY)`);
    console.log(`Total Batch Cost:          ${breakdown.totalBatchCost} TRY (Sheet: 927.59 TRY)`);
    console.log(`Cost Per Cupcake:          ${breakdown.costPerSlice} TRY (Sheet: 51.53 TRY)`);
    console.log(`========================================\n`);
  }
}

main().finally(() => prisma.$disconnect());
