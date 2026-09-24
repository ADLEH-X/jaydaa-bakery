const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          recipe: true,
        },
      },
      cafe: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Found ${orders.length} order(s):`);
  for (const order of orders) {
    console.log({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      status: order.status,
      customer: order.cafe ? order.cafe.name : 'Unknown',
      itemsCount: order.items.length,
      createdAt: order.createdAt,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
