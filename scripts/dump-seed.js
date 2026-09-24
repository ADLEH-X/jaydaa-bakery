const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const materials = await prisma.rawMaterial.findMany();
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: true,
    },
  });
  const cafes = await prisma.cafe.findMany();
  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
  });

  const content = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.recipeIngredient.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.rawMaterial.deleteMany({});
  await prisma.cafe.deleteMany({});

  console.log('Seeding authentic raw materials...');
  const materialsData = ${JSON.stringify(materials, null, 2)};
  for (const m of materialsData) {
    await prisma.rawMaterial.create({
      data: {
        id: m.id,
        name: m.name,
        category: m.category,
        purchaseQuantity: m.purchaseQuantity,
        purchaseUnit: m.purchaseUnit,
        purchaseCost: m.purchaseCost,
        unitCost: m.unitCost,
      },
    });
  }

  console.log('Seeding authentic recipes...');
  const recipesData = ${JSON.stringify(recipes, null, 2)};
  for (const r of recipesData) {
    await prisma.recipe.create({
      data: {
        id: r.id,
        name: r.name,
        skuPrefix: r.skuPrefix,
        description: r.description,
        yieldSlices: r.yieldSlices,
        ovenMinutes: r.ovenMinutes,
        shelfLifeDays: r.shelfLifeDays,
        overheadPercent: r.overheadPercent,
        outerBoxCost: r.outerBoxCost,
        wrapCostPerSlice: r.wrapCostPerSlice,
        labelCostPerSlice: r.labelCostPerSlice,
        ingredients: {
          create: r.ingredients.map((ing) => ({
            id: ing.id,
            rawMaterialId: ing.rawMaterialId,
            quantityUsed: ing.quantityUsed,
          })),
        },
      },
    });
  }

  console.log('Seeding customer cafes...');
  const cafesData = ${JSON.stringify(cafes, null, 2)};
  for (const c of cafesData) {
    await prisma.cafe.create({
      data: {
        id: c.id,
        name: c.name,
        branch: c.branch,
        contactPerson: c.contactPerson,
        phone: c.phone,
        clientCode: c.clientCode,
        defaultPaymentMethod: c.defaultPaymentMethod,
        defaultPricePerSlice: c.defaultPricePerSlice,
      },
    });
  }

  console.log('Seeding initial order...');
  const ordersData = ${JSON.stringify(orders, null, 2)};
  for (const o of ordersData) {
    await prisma.order.create({
      data: {
        id: o.id,
        invoiceRef: o.invoiceRef,
        cafeId: o.cafeId,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentTerms: o.paymentTerms,
        orderDate: new Date(o.orderDate),
        deliveryDate: new Date(o.deliveryDate),
        dispatchTime: o.dispatchTime,
        totalLoaves: o.totalLoaves,
        totalSlices: o.totalSlices,
        totalCost: o.totalCost,
        totalRevenue: o.totalRevenue,
        netProfit: o.netProfit,
        profitMargin: o.profitMargin,
        notes: o.notes,
        items: {
          create: o.items.map((it) => ({
            id: it.id,
            recipeId: it.recipeId,
            loavesOrdered: it.loavesOrdered,
            yieldPerLoaf: it.yieldPerLoaf,
            totalSlices: it.totalSlices,
            unitCostPerSlice: it.unitCostPerSlice,
            pricePerSlice: it.pricePerSlice,
            lineCost: it.lineCost,
            lineRevenue: it.lineRevenue,
            lineProfit: it.lineProfit,
            batchCode: it.batchCode,
            productionDate: new Date(it.productionDate),
            bestBeforeDate: new Date(it.bestBeforeDate),
          })),
        },
      },
    });
  }

  console.log('Database successfully seeded with authentic bakery data!');
}

seedDatabase()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  fs.writeFileSync(path.join(__dirname, '../prisma/seed.ts'), content, 'utf-8');
  console.log('prisma/seed.ts updated successfully with current live data!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
