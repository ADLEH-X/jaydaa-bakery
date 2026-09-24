const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllData() {
  console.log('Clearing all operational data...');

  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`Deleted ${deletedOrderItems.count} order items.`);

  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`Deleted ${deletedOrders.count} orders.`);

  const deletedRecipeIngredients = await prisma.recipeIngredient.deleteMany({});
  console.log(`Deleted ${deletedRecipeIngredients.count} recipe ingredients.`);

  const deletedRecipes = await prisma.recipe.deleteMany({});
  console.log(`Deleted ${deletedRecipes.count} recipes.`);

  const deletedRawMaterials = await prisma.rawMaterial.deleteMany({});
  console.log(`Deleted ${deletedRawMaterials.count} raw materials.`);

  const deletedCafes = await prisma.cafe.deleteMany({});
  console.log(`Deleted ${deletedCafes.count} cafes.`);

  console.log('\nAll data has been completely cleared. Database is ready for your real data.');
}

clearAllData()
  .catch((err) => {
    console.error('Error clearing data:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
