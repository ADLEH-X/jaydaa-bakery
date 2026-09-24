const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMomoe() {
  const cafe = await prisma.cafe.create({
    data: {
      name: 'Momoe Cafe',
      branch: 'Ortabayır, Çeşmebaşi Sk 55a, Kağıthane/İstanbul',
      contactPerson: 'Store Manager / Barista',
      phone: '+905015595099',
      clientCode: 'MC-001',
      defaultPricePerSlice: 1.4,
      defaultPaymentMethod: 'COD',
    },
  });

  console.log('Customer added successfully:');
  console.log(JSON.stringify(cafe, null, 2));
}

addMomoe()
  .catch((e) => {
    console.error('Error adding customer:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
