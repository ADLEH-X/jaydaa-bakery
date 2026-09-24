const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetId = 'cmufwdhoq0001e8h9nsc2zq4i';
  const order = await prisma.order.findUnique({
    where: { id: targetId },
    include: {
      items: {
        include: {
          recipe: true,
        },
      },
      cafe: true,
    },
  });

  if (!order) {
    console.log('Order not found!');
    return;
  }

  console.log('Found order to delete:');
  console.log({
    id: order.id,
    invoiceRef: order.invoiceRef,
    customer: order.cafe.name,
    orderDate: order.orderDate,
    deliveryDate: order.deliveryDate,
    status: order.status,
    totalLoaves: order.totalLoaves,
    totalCost: order.totalCost,
    totalRevenue: order.totalRevenue,
    netProfit: order.netProfit,
    items: order.items.map((it) => ({
      product: it.recipe.name,
      loaves: it.loavesOrdered,
      slices: it.totalSlices,
      revenue: it.lineRevenue,
    })),
  });

  const deleted = await prisma.order.delete({
    where: { id: targetId },
  });

  console.log('Successfully deleted order:', deleted.id, deleted.invoiceRef);

  const remainingOrders = await prisma.order.findMany({
    select: {
      id: true,
      invoiceRef: true,
      orderDate: true,
      deliveryDate: true,
      status: true,
      totalRevenue: true,
    },
  });
  console.log('Remaining orders in database:', remainingOrders);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
