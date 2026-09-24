const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Inserting first product and raw materials into Jaydaa Bakery database...');

  // 1. Raw Materials (Cake Mixture Ingredients)
  const egg = await prisma.rawMaterial.create({
    data: {
      name: 'Fresh Eggs (Migros 30 Pcs)',
      category: 'INGREDIENT',
      purchaseQuantity: 30,
      purchaseUnit: 'pcs',
      purchaseCost: 170.0,
      unitCost: 170.0 / 30, // 5.66667
    },
  });

  const vanilla = await prisma.rawMaterial.create({
    data: {
      name: 'Vanilla (Dr. Oetker 50g)',
      category: 'INGREDIENT',
      purchaseQuantity: 50,
      purchaseUnit: 'g',
      purchaseCost: 25.0,
      unitCost: 25.0 / 50, // 0.50
    },
  });

  const sugar = await prisma.rawMaterial.create({
    data: {
      name: 'Granulated Sugar (Migros 1kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 53.0,
      unitCost: 53.0 / 1000, // 0.053
    },
  });

  const oil = await prisma.rawMaterial.create({
    data: {
      name: 'Vegetable Oil (Migros 1kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 1000,
      purchaseUnit: 'g',
      purchaseCost: 126.0,
      unitCost: 126.0 / 1000, // 0.126
    },
  });

  const yogurt = await prisma.rawMaterial.create({
    data: {
      name: 'Yogurt (Migros 1.5kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 1500,
      purchaseUnit: 'g',
      purchaseCost: 103.0,
      unitCost: 103.0 / 1500, // 0.06867
    },
  });

  const flour = await prisma.rawMaterial.create({
    data: {
      name: 'Flour (Migros 2kg)',
      category: 'INGREDIENT',
      purchaseQuantity: 2000,
      purchaseUnit: 'g',
      purchaseCost: 61.0,
      unitCost: 61.0 / 2000, // 0.0305
    },
  });

  const bakingPowder = await prisma.rawMaterial.create({
    data: {
      name: 'Baking Powder (Dr. Oetker 100g)',
      category: 'INGREDIENT',
      purchaseQuantity: 100,
      purchaseUnit: 'g',
      purchaseCost: 34.0,
      unitCost: 34.0 / 100, // 0.34
    },
  });

  const labneh = await prisma.rawMaterial.create({
    data: {
      name: 'Labneh (İçim 400g)',
      category: 'INGREDIENT',
      purchaseQuantity: 400,
      purchaseUnit: 'g',
      purchaseCost: 166.0,
      unitCost: 166.0 / 400, // 0.415
    },
  });

  const zaatar = await prisma.rawMaterial.create({
    data: {
      name: 'Zaatar (Bludan Market Jordan 250g)',
      category: 'INGREDIENT',
      purchaseQuantity: 250,
      purchaseUnit: 'g',
      purchaseCost: 100.0,
      unitCost: 100.0 / 250, // 0.40
    },
  });

  // 2. Packaging & Overhead Materials in Library
  await prisma.rawMaterial.create({
    data: {
      name: 'Cupcake Box (AVM 20 Pcs)',
      category: 'PACKAGING',
      purchaseQuantity: 20,
      purchaseUnit: 'pcs',
      purchaseCost: 200.0,
      unitCost: 10.0,
    },
  });

  await prisma.rawMaterial.create({
    data: {
      name: 'Branding & Allergen Stickers (Kırtasiye 20 Pcs)',
      category: 'PACKAGING',
      purchaseQuantity: 20,
      purchaseUnit: 'pcs',
      purchaseCost: 20.0,
      unitCost: 1.0,
    },
  });

  await prisma.rawMaterial.create({
    data: {
      name: 'Transport Bag (AVM 1 Pc)',
      category: 'PACKAGING',
      purchaseQuantity: 1,
      purchaseUnit: 'pcs',
      purchaseCost: 10.0,
      unitCost: 10.0,
    },
  });

  await prisma.rawMaterial.create({
    data: {
      name: 'Electricity / Water Utility (Gov)',
      category: 'OVERHEAD',
      purchaseQuantity: 1,
      purchaseUnit: 'pcs',
      purchaseCost: 7.0,
      unitCost: 7.0,
    },
  });

  // 3. Create Recipe: Zaatar & Labneh Savory Cupcakes
  // Raw ingredients sum = 405.59 TRY
  // Overhead 126 TRY = 126 / 405.5855 = 0.31066 (31.066%)
  // Packaging per cupcake = 10 (box) + 10 (bag) + 2 (2 stickers) = 22.00 TRY
  // Yield = 18 cupcakes
  const recipe = await prisma.recipe.create({
    data: {
      name: 'Zaatar & Labneh Savory Cupcakes',
      skuPrefix: 'ZLC',
      description: 'Handcrafted savory zaatar cupcakes with creamy İçim labneh, individually portioned in custom cupcake boxes and transport bags with branding stickers',
      yieldSlices: 18,
      ovenMinutes: 25,
      shelfLifeDays: 4,
      overheadPercent: 0.31066, // 126 TRY overhead for 18 cupcakes
      wrapCostPerSlice: 20.0,   // 10 TRY box + 10 TRY bag
      labelCostPerSlice: 2.0,   // 2 stickers @ 1 TRY
      outerBoxCost: 0.0,
      ingredients: {
        create: [
          { rawMaterialId: egg.id, quantityUsed: 3 },
          { rawMaterialId: vanilla.id, quantityUsed: 3 },
          { rawMaterialId: sugar.id, quantityUsed: 115 },
          { rawMaterialId: oil.id, quantityUsed: 95 },
          { rawMaterialId: yogurt.id, quantityUsed: 170 },
          { rawMaterialId: flour.id, quantityUsed: 195 },
          { rawMaterialId: bakingPowder.id, quantityUsed: 10 },
          { rawMaterialId: labneh.id, quantityUsed: 800 },
          { rawMaterialId: zaatar.id, quantityUsed: 40 },
        ],
      },
    },
  });

  // Update Momoe Cafe default price per cupcake to 80.00 TRY (at ~36% margin over 51.53 TRY cost)
  await prisma.cafe.updateMany({
    data: {
      defaultPricePerSlice: 80.0,
    },
  });

  console.log('\nRecipe created successfully:');
  console.log(`[${recipe.skuPrefix}] ${recipe.name}`);
  console.log(`Yield: ${recipe.yieldSlices} cupcakes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
