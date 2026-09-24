/* eslint-disable @typescript-eslint/no-explicit-any */
export function renderInvoiceHtml(order: any, isInteractive = false): string {
  const rows = order.items
    .map(
      (item: any, idx: number) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td>
        <div style="font-weight: 700; color: #3b281f; font-size: 9.5pt;">${item.recipe.name}</div>
        <div style="font-size: 7.8pt; color: #7d6e66;">Pre-portioned & individually packaged in food-grade sealed containers with allergen labels</div>
        <div style="display: inline-block; background-color: #f5ebe1; color: #5e4533; padding: 1px 5px; border-radius: 3px; font-size: 7.5pt; font-weight: 600; margin-top: 2px;">
          Batch #${item.batchCode} • Prod: ${new Date(item.productionDate).toLocaleDateString('en-GB')} • Expiry: ${new Date(item.bestBeforeDate).toLocaleDateString('en-GB')}
        </div>
      </td>
      <td style="text-align: center;"><strong>${item.loavesOrdered}</strong></td>
      <td style="text-align: center;">${item.yieldPerLoaf} pcs</td>
      <td style="text-align: center;"><strong>${item.totalSlices} pcs</strong></td>
      <td style="text-align: right;">₺${item.pricePerSlice.toFixed(2)}</td>
      <td style="text-align: right;"><strong>₺${item.lineRevenue.toFixed(2)}</strong></td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice #${order.invoiceRef} - Jaydaa Bakery</title>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; background-color: #fcfaf7; color: #2b2420; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 9.5pt; line-height: 1.45; }
  .layout-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .layout-table td { padding: 0; vertical-align: top; }
  .brand-badge { display: inline-block; background-color: #3b281f; color: #f7e8d0; font-weight: 700; font-size: 13pt; letter-spacing: 2px; padding: 6px 14px; border-radius: 4px; margin-bottom: 6px; text-transform: uppercase; }
  .gold-divider { height: 3px; background: #c2884a; width: 100%; margin-bottom: 16px; border-radius: 2px; }
  .info-box { background-color: #ffffff; border: 1px solid #ebdcd0; border-radius: 6px; padding: 12px 14px; }
  .items-table { width: 100%; border-collapse: collapse; margin: 14px 0; background-color: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #ebdcd0; }
  .items-table th { background-color: #3b281f; color: #f7e8d0; font-size: 8pt; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; padding: 9px 10px; text-align: left; }
  .items-table td { padding: 10px; border-bottom: 1px solid #f2e9e1; font-size: 8.5pt; vertical-align: top; }
  .items-table tr:nth-child(even) td { background-color: #fdfbf9; }
  .calc-table { width: 100%; border-collapse: collapse; font-size: 9pt; background-color: #ffffff; border: 1px solid #ebdcd0; border-radius: 6px; overflow: hidden; }
  .calc-table td { padding: 7px 12px; border-bottom: 1px solid #f2e9e1; }
  .sign-table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #ffffff; border: 1px solid #ebdcd0; border-radius: 6px; }
  .sign-table td { width: 50%; padding: 12px 14px; vertical-align: top; font-size: 8pt; color: #5e524b; }

  @media screen {
    body { max-width: 860px; margin: 0 auto; padding: 20px; }
    .page-wrapper { background: #ffffff; border: 1px solid #ebdcd0; border-radius: 8px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  }

  @media print {
    .no-print { display: none !important; }
    body { background-color: #ffffff !important; padding: 0 !important; }
    .page-wrapper { border: none !important; padding: 0 !important; box-shadow: none !important; }
  }
</style>
</head>
<body>
  ${
    isInteractive
      ? `
  <div class="no-print" style="position: sticky; top: 10px; background: #3b281f; color: #f7e8d0; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 16px rgba(0,0,0,0.18); z-index: 9999; margin-bottom: 20px; border-radius: 8px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-weight: 800; font-size: 13px; letter-spacing: 1px; color: #ffffff;">JAYDAA BAKERY</span>
      <span style="background: rgba(255,255,255,0.15); padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600;">#${order.invoiceRef}</span>
      <span style="font-size: 12px; color: #ebdcd0;">• Official A4 Billing Document</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #c2884a; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12.5px; display: flex; align-items: center; gap: 6px;">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" style="background: rgba(255,255,255,0.15); color: #ffffff; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12.5px;">
        ✕ Close
      </button>
    </div>
  </div>
  `
      : ''
  }

  <div class="page-wrapper">
    <table class="layout-table">
      <tr>
        <td style="width: 60%;">
          <div class="brand-badge">Jaydaa Bakery</div>
          <div style="font-size: 8.5pt; color: #7d6e66; margin-bottom: 6px;">Handcrafted B2B Sweets & Specialty Cafe Supplies</div>
          <div style="font-size: 8pt; color: #5e524b; line-height: 1.4;">Commercial Orders & Enquiries: orders@jaydaabakery.com<br>Freshly baked daily • Food-grade individual seal certified</div>
        </td>
        <td style="width: 40%; text-align: right;">
          <div style="font-size: 18pt; font-weight: 800; color: #3b281f; margin: 0 0 4px 0;">INVOICE & DELIVERY</div>
          <div style="font-size: 8.5pt; margin-bottom: 2px;"><strong>Invoice Ref:</strong> #${order.invoiceRef}</div>
          <div style="font-size: 8.5pt; margin-bottom: 2px;"><strong>Issue Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-GB')}</div>
          <div style="font-size: 8.5pt; margin-bottom: 2px;"><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString('en-GB')}</div>
          <div style="font-size: 8.5pt;"><strong>Payment Terms:</strong> <span style="background-color: #ebd5be; color: #3b281f; padding: 2px 6px; border-radius: 3px; font-weight: 700;">${order.paymentTerms}</span></div>
        </td>
      </tr>
    </table>

    <div class="gold-divider"></div>

    <table class="layout-table">
      <tr>
        <td style="width: 49%;">
          <div class="info-box">
            <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #c2884a; margin-bottom: 6px; border-bottom: 1px solid #f2e9e1; padding-bottom: 4px;">Bill & Deliver To (Client)</div>
            <div style="font-size: 11pt; font-weight: 700; color: #3b281f; margin-bottom: 2px;">${order.cafe.name}</div>
            <div style="font-size: 8.5pt; color: #5e524b; line-height: 1.4;">
              <strong>Branch:</strong> ${order.cafe.branch}<br>
              <strong>Contact:</strong> ${order.cafe.contactPerson}<br>
              <strong>Phone:</strong> ${order.cafe.phone}<br>
              <strong>Client Account ID:</strong> ${order.cafe.clientCode}
            </div>
          </div>
        </td>
        <td style="width: 2%;"></td>
        <td style="width: 49%;">
          <div class="info-box">
            <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #c2884a; margin-bottom: 6px; border-bottom: 1px solid #f2e9e1; padding-bottom: 4px;">Batch & Fulfillment Protocol</div>
            <div style="font-size: 11pt; font-weight: 700; color: #3b281f; margin-bottom: 2px;">Fresh Daily Dispatch</div>
            <div style="font-size: 8.5pt; color: #5e524b; line-height: 1.4;">
              <strong>Dispatch Time:</strong> ${order.dispatchTime}<br>
              <strong>Packaging Standard:</strong> Individually portioned, Food-grade sealed packaging<br>
              <strong>Storage Temp:</strong> 18°C – 22°C (Ambient display / refrigerated shelf)<br>
              <strong>Delivery Agent:</strong> Jaydaa Direct Delivery
            </div>
          </div>
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%; text-align: center;">#</th>
          <th style="width: 43%;">Description & Specs</th>
          <th style="width: 12%; text-align: center;">Batches</th>
          <th style="width: 12%; text-align: center;">Yield / Batch</th>
          <th style="width: 12%; text-align: center;">Total Units</th>
          <th style="width: 16%; text-align: right;">Price / Unit</th>
          <th style="width: 15%; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <table class="layout-table">
      <tr>
        <td style="width: 55%; padding-right: 16px;">
          <div style="background-color: #f7f3ed; border-left: 3px solid #c2884a; padding: 10px 12px; border-radius: 0 4px 4px 0; font-size: 8pt; color: #5e524b; margin-bottom: 10px;">
            <strong style="color: #3b281f;">Food Safety & Shelf-Life Assurance:</strong> All items are baked in sanitized facilities, portioned with commercial hygiene standards, and individually packaged with tamper-proof seal. Best enjoyed within 4 days of delivery.
          </div>
          <div style="background-color: #f7f3ed; border-left: 3px solid #3b281f; padding: 10px 12px; border-radius: 0 4px 4px 0; font-size: 8pt; color: #5e524b;">
            <strong style="color: #3b281f;">Payment Methods:</strong><br>
            Bank Transfer / Cash on Delivery.<br>
            Account Name: <strong>Jaydaa Bakery</strong> • Payment Terms: <strong>${order.paymentTerms}</strong>
          </div>
        </td>
        <td style="width: 45%;">
          <table class="calc-table">
            <tr>
              <td style="color: #7d6e66; font-weight: 600;">Total Batches Delivered:</td>
              <td style="text-align: right; font-weight: 700; color: #2b2420;">${order.totalLoaves} Batches</td>
            </tr>
            <tr>
              <td style="color: #7d6e66; font-weight: 600;">Total Wrapped Units:</td>
              <td style="text-align: right; font-weight: 700; color: #2b2420;">${order.totalSlices} Units</td>
            </tr>
            <tr>
              <td style="color: #7d6e66; font-weight: 600;">Wholesale Subtotal:</td>
              <td style="text-align: right; font-weight: 700; color: #2b2420;">₺${order.totalRevenue.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #7d6e66; font-weight: 600;">B2B Scheduled Delivery:</td>
              <td style="text-align: right; font-weight: 700; color: #27ae60;">FREE</td>
            </tr>
            <tr style="background-color: #3b281f; color: #ffffff;">
              <td style="padding: 10px 12px; font-weight: 800; font-size: 11pt;">TOTAL DUE:</td>
              <td style="padding: 10px 12px; text-align: right; font-weight: 800; font-size: 11pt; color: #f7e8d0;">₺${order.totalRevenue.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table class="sign-table">
      <tr>
        <td style="border-right: 1px solid #f2e9e1;">
          <strong style="color: #3b281f;">Delivered By (Jaydaa Bakery):</strong>
          <div style="border-bottom: 1px dashed #c4b5aa; margin-top: 28px; margin-bottom: 4px;"></div>
          <div style="font-size: 7.5pt; color: #8c827a; text-transform: uppercase;">Signature & Time of Drop-off</div>
        </td>
        <td>
          <strong style="color: #3b281f;">Received & Inspected By (Coffee Shop):</strong>
          <div style="border-bottom: 1px dashed #c4b5aa; margin-top: 28px; margin-bottom: 4px;"></div>
          <div style="font-size: 7.5pt; color: #8c827a; text-transform: uppercase;">Manager / Barista Signature & Seal</div>
        </td>
      </tr>
    </table>
  </div>

  ${
    isInteractive
      ? `
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
  `
      : ''
  }
</body>
</html>`;
}
