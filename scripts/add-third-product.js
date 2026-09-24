const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding Marble Cake raw materials and recipe...');

  // 1. Locate existing raw materials
  const egg = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Fresh Eggs (Migros' } },
  });
  const sugar = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Granulated Sugar (Makbul' } },
  });
  const oil = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Vegetable Oil' } },
  });
  const butter = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Butter (Migros' } },
  });
  const flour = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Flour (Migros' } },
  });
  const milk = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Whole Milk (Migros' } },
  });
  const bakingPowder = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Baking Powder' } },
  });
  const vanilla = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Vanilla' } },
  });
  const elecWater = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Electricity' } },
  });

  if (!egg || !sugar || !oil || !butter || !flour || !milk || !bakingPowder || !vanilla || !elecWater) {
    throw new Error('Could not locate one or more existing raw materials!');
  }

  // 2. Add New Raw Materials (if not existing)
  let cacao = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Cacao Powder' } },
  });
  if (!cacao) {
    cacao = await prisma.rawMaterial.create({
      data: {
        name: 'Cacao Powder (Migros 50g)',
        category: 'INGREDIENT',
        purchaseQuantity: 50,
        purchaseUnit: 'g',
        purchaseCost: 29.0,
        unitCost: 29.0 / 50, // 0.58
      },
    });
    console.log('Created raw material: Cacao Powder (Migros 50g)');
  }

  let plasticBag = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Plastic Bag (AVM' } },
  });
  if (!plasticBag) {
    plasticBag = await prisma.rawMaterial.create({
      data: {
        name: 'Plastic Bag (AVM 100 Pcs)',
        category: 'PACKAGING',
        purchaseQuantity: 100,
        purchaseUnit: 'pcs',
        purchaseCost: 250.0,
        unitCost: 250.0 / 100, // 2.50
      },
    });
    console.log('Created raw material: Plastic Bag (AVM 100 Pcs)');
  }

  // 3. Create or Update Recipe: Marble Cake
  let existingRecipe = await prisma.recipe.findFirst({
    where: { OR: [{ name: 'Marble Cake' }, { skuPrefix: 'MBC' }] },
  });

  if (existingRecipe) {
    console.log('Marble Cake recipe already exists, deleting old one to re-create cleanly...');
    await prisma.recipe.delete({ where: { id: existingRecipe.id } });
  }

  const recipe = await prisma.recipe.create({
    data: {
      name: 'Marble Cake',
      skuPrefix: 'MBC',
      description: 'Classic rich marble cake baked with premium Migros cacao swirl and golden butter crumb, packaged in individual hygienic plastic bags',
      yieldSlices: 8,
      ovenMinutes: 30,
      shelfLifeDays: 5,
      overheadPercent: 0.0,
      wrapCostPerSlice: 2.50, // 20.00 TRY / 8 plastic bags
      labelCostPerSlice: 0.0,
      outerBoxCost: 0.0,
      ingredients: {
        create: [
          { rawMaterialId: egg.id, quantityUsed: 3 },            // 3 pcs @ 5.667 = 17.00 TRY
          { rawMaterialId: sugar.id, quantityUsed: 180 },        // 180g @ 0.043 = 7.74 TRY
          { rawMaterialId: oil.id, quantityUsed: 55 },           // 55g @ 0.126 = 6.93 TRY
          { rawMaterialId: butter.id, quantityUsed: 55 },        // 55g @ 0.624 = 34.32 TRY
          { rawMaterialId: flour.id, quantityUsed: 200 },        // 200g @ 0.0305 = 6.10 TRY
          { rawMaterialId: milk.id, quantityUsed: 60 },          // 60g @ 0.044 = 2.64 TRY
          { rawMaterialId: bakingPowder.id, quantityUsed: 10 },  // 10g @ 0.34 = 3.40 TRY
          { rawMaterialId: cacao.id, quantityUsed: 14 },         // 14g @ 0.58 = 8.12 TRY
          { rawMaterialId: vanilla.id, quantityUsed: 5 },        // 5g @ 0.50 = 2.50 TRY
          { rawMaterialId: elecWater.id, quantityUsed: 8 },      // 8 units @ 7.00 = 56.00 TRY
        ],
      },
    },
    include: {
      ingredients: {
        include: {
          rawMaterial: true,
        },
      },
    },
  });

  console.log('\nRecipe created successfully:');
  console.log(`[${recipe.skuPrefix}] ${recipe.name}`);
  console.log(`Yield: ${recipe.yieldSlices} units`);

  // Calculate totals
  const ingCost = recipe.ingredients.reduce(
    (sum, ing) => sum + ing.quantityUsed * ing.rawMaterial.unitCost,
    0
  );
  const pkgCost = recipe.wrapCostPerSlice * recipe.yieldSlices;
  const totalBatch = ingCost + pkgCost;
  const costPerUnit = totalBatch / recipe.yieldSlices;

  console.log(`Ingredients Cost: ₺${ingCost.toFixed(2)} (Sheet: ₺144.75)`);
  console.log(`Packaging Cost: ₺${pkgCost.toFixed(2)} (Sheet: ₺20.00)`);
  console.log(`Total Batch Cost: ₺${totalBatch.toFixed(2)} (Sheet: ₺164.75)`);
  console.log(`Cost Per Unit: ₺${costPerUnit.toFixed(4)} (Sheet: ₺20.5938)`);
}

main()
  .catch((e) => {
    console.error('Error adding recipe:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
