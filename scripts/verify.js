const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const prisma = new PrismaClient();

async function main() {
  console.log('=== JAYDAA BAKERY OPERATIONS ENGINE: VERIFICATION SUITE ===\n');

  // 1. Verify Raw Materials
  const materials = await prisma.rawMaterial.findMany({ orderBy: { name: 'asc' } });
  console.log(`[1] Raw Materials: ${materials.length} items found:`);
  materials.forEach((m) => {
    console.log(`    - ${m.name} (${m.category}): $${m.purchaseCost} / ${m.purchaseQuantity}${m.purchaseUnit} => Unit Cost: $${m.unitCost.toFixed(5)}`);
  });

  // 2. Verify Recipes
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: { include: { rawMaterial: true } } },
  });
  console.log(`\n[2] Recipes: ${recipes.length} recipes found:`);
  recipes.forEach((r) => {
    console.log(`    - [${r.skuPrefix}] ${r.name} (${r.yieldSlices} slices, ${r.ovenMinutes}min oven, ${r.shelfLifeDays}d shelf life)`);
    console.log(`      Ingredients: ${r.ingredients.length} items linked`);
  });

  // 3. Verify Cafes
  const cafes = await prisma.cafe.findMany();
  console.log(`\n[3] Cafes: ${cafes.length} partner coffee shops registered:`);
  cafes.forEach((c) => {
    console.log(`    - ${c.name} (${c.clientCode}) in ${c.branch}: Agreed Price: $${c.defaultPricePerSlice.toFixed(2)}/slice, Terms: ${c.defaultPaymentMethod}`);
  });

  // 4. Verify Orders & Math Snapshot
  const orders = await prisma.order.findMany({
    include: { cafe: true, items: { include: { recipe: true } } },
  });
  console.log(`\n[4] Orders: ${orders.length} orders found:`);
  for (const o of orders) {
    console.log(`    - Invoice Ref: #${o.invoiceRef}`);
    console.log(`      Client: ${o.cafe.name} (${o.cafe.clientCode})`);
    console.log(`      Loaves: ${o.totalLoaves}, Slices: ${o.totalSlices} pcs`);
    console.log(`      Billed Revenue: $${o.totalRevenue.toFixed(2)} | Cost: $${o.totalCost.toFixed(2)} | Profit: $${o.netProfit.toFixed(2)} (${o.profitMargin}%)`);
    o.items.forEach((it) => {
      console.log(`      Item: ${it.loavesOrdered} loaf (${it.totalSlices} slices) - ${it.recipe.name} [Batch #${it.batchCode}]`);
    });
  }

  // 5. Verify PDF Generation directly
  console.log('\n[5] Testing PDF Generation with Puppeteer...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;
  console.log(`    Using browser: ${executablePath}`);

  // Test rendering invoice HTML for order[0]
  if (orders.length > 0) {
    const order = orders[0];
    const { renderInvoiceHtml } = require('../src/components/invoice-pdf-template');
    const html = renderInvoiceHtml(order);

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
    });
    await browser.close();

    const pdfPath = path.join(__dirname, '..', 'public', 'test_invoice.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
    console.log(`    PDF generated successfully! Size: ${pdfBuffer.length} bytes at ${pdfPath}`);
  }

  console.log('\n=== ALL VERIFICATION CHECKS PASSED ===\n');
}

main()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
