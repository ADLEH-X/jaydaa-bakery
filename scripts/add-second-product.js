const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding Carrot Walnut Cupcake materials and recipe...');

  // 1. Find existing materials
  const existingEgg = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Eggs' } },
  });
  const existingOil = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Oil' } },
  });
  const existingFlour = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Flour' } },
  });
  const existingVanilla = await prisma.rawMaterial.findFirst({
    where: { name: { contains: 'Vanilla' } },
  });

  // 2. Add New Raw Materials
  const brownSugar = await prisma.rawMaterial.create({
    data: {
      name: 'Brown Sugar (Takita 500g)',
      category: 'INGREDIENT',
      purchaseQuantity: 500,
      purchaseUnit: 'g',
      purchaseCost: 140.0,
      unitCost: 140.0 / 500, // 0.28
    },
  });

  const sugarMakbul = await prisma.rawMaterial.create({
    data: {
      name: 'Granulated Sugar (Makbul 1kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 43.0,
      unitCost: 43.0 / 1000, // 0.043
    },
  });

  const butter = await prisma.rawMaterial.create({
    data: {
      name: 'Butter (Migros 250g)',
      category: 'INGREDIENT',
      purchaseQuantity: 250,
      purchaseUnit: 'g',
      purchaseCost: 156.0,
      unitCost: 156.0 / 250, // 0.624
    },
  });

  const bakingSoda = await prisma.rawMaterial.create({
    data: {
      name: 'Baking Soda (Bağdat 150g)',
      category: 'INGREDIENT',
      purchaseQuantity: 150,
      purchaseUnit: 'g',
      purchaseCost: 43.0,
      unitCost: 43.0 / 150, // 0.28667
    },
  });

  const walnut = await prisma.rawMaterial.create({
    data: {
      name: 'Walnuts (Makbul 1kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 549.0,
      unitCost: 549.0 / 1000, // 0.549
    },
  });

  const carrot = await prisma.rawMaterial.create({
    data: {
      name: 'Fresh Carrots (Migros 1kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 40.0,
      unitCost: 40.0 / 1000, // 0.040
    },
  });

  const cinnamon = await prisma.rawMaterial.create({
    data: {
      name: 'Cinnamon & Spices (Makbul 1kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 250.0,
      unitCost: 250.0 / 1000, // 0.250
    },
  });

  const milk = await prisma.rawMaterial.create({
    data: {
      name: 'Whole Milk (Migros 1L)',
      category: 'INGREDIENT',
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 44.0,
      unitCost: 44.0 / 1000, // 0.044
    },
  });

  const labnehMigros = await prisma.rawMaterial.create({
    data: {
      name: 'Labneh Cream Cheese (Migros 200g)',
      category: 'INGREDIENT',
      purchaseQuantity: 200,
      purchaseUnit: 'g',
      purchaseCost: 57.0,
      unitCost: 57.0 / 200, // 0.285
    },
  });

  const powderedSugar = await prisma.rawMaterial.create({
    data: {
      name: 'Powdered Sugar (Makbul 1kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 80.0,
      unitCost: 80.0 / 1000, // 0.080
    },
  });

  const foodColoring = await prisma.rawMaterial.create({
    data: {
      name: 'Food Coloring (Market 15g)',
      category: 'PACKAGING',
      purchaseQuantity: 15,
      purchaseUnit: 'g',
      purchaseCost: 25.0,
      unitCost: 25.0 / 15, // 1.66667
    },
  });

  const cupcakePaper = await prisma.rawMaterial.create({
    data: {
      name: 'Cupcake Paper Liners (AVM 100 Pcs)',
      category: 'PACKAGING',
      purchaseQuantity: 100,
      purchaseUnit: 'pcs',
      purchaseCost: 95.0,
      unitCost: 95.0 / 100, // 0.95
    },
  });

  // 3. Create Recipe: Spiced Carrot Walnut Cupcakes
  // Raw Ingredients Sum = 270.47 TRY
  // Overhead Buffer = 105.00 TRY (105 / 270.468 = 0.388216)
  // Packaging per cupcake = 11.28333 TRY (150 box + 14.25 paper + 5 coloring = 169.25 / 15)
  // Yield = 15 cupcakes
  // Total Batch Cost = 270.47 + 105.00 + 169.25 = 544.72 TRY
  // Cost Per Cupcake = 36.314 TRY
  const recipe = await prisma.recipe.create({
    data: {
      name: 'Carrot Walnut Cupcake with Cream Cheese Frosting',
      skuPrefix: 'CWC',
      description: 'Moist spiced carrot walnut cupcakes with cinnamon topped with velvety labneh cream cheese frosting, presented in individual cupcake liners and display boxes',
      yieldSlices: 15,
      ovenMinutes: 25,
      shelfLifeDays: 4,
      overheadPercent: 0.388216, // 105 TRY electricity/water for 15 cupcakes
      wrapCostPerSlice: 10.95,   // 10.00 TRY box + 0.95 TRY paper liner
      labelCostPerSlice: 0.33333,// 5.00 TRY / 15 food coloring garnish
      outerBoxCost: 0.0,
      ingredients: {
        create: [
          { rawMaterialId: existingEgg.id, quantityUsed: 3 },
          { rawMaterialId: brownSugar.id, quantityUsed: 107 },
          { rawMaterialId: sugarMakbul.id, quantityUsed: 100 },
          { rawMaterialId: existingOil.id, quantityUsed: 50 },
          { rawMaterialId: butter.id, quantityUsed: 132 }, // 57g in cake + 75g in cream
          { rawMaterialId: existingFlour.id, quantityUsed: 150 },
          { rawMaterialId: bakingSoda.id, quantityUsed: 6 },
          { rawMaterialId: walnut.id, quantityUsed: 100 },
          { rawMaterialId: carrot.id, quantityUsed: 125 },
          { rawMaterialId: cinnamon.id, quantityUsed: 12 },
          { rawMaterialId: milk.id, quantityUsed: 82 },
          { rawMaterialId: labnehMigros.id, quantityUsed: 150 },
          { rawMaterialId: powderedSugar.id, quantityUsed: 156 },
          { rawMaterialId: existingVanilla.id, quantityUsed: 5 },
        ],
      },
    },
  });

  console.log('\nRecipe created successfully:');
  console.log(`[${recipe.skuPrefix}] ${recipe.name}`);
  console.log(`Yield: ${recipe.yieldSlices} cupcakes`);
}

main()
  .catch((e) => {
    console.error('Error adding recipe:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
