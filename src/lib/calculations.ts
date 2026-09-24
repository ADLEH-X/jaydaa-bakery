export interface RecipeCostBreakdown {
  rawIngredientsCost: number;
  overheadBufferCost: number;
  slicePackagingTotal: number;
  outerBoxCost: number;
  totalBatchCost: number;
  costPerSlice: number;
}

/**
 * 1. Calculates Raw Material Unit Cost
 */
export function calculateRawMaterialUnitCost(purchaseCost: number, purchaseQuantity: number): number {
  if (purchaseQuantity <= 0) return 0;
  return Number((purchaseCost / purchaseQuantity).toFixed(5));
}

/**
 * 2. Calculates Complete Cost-per-Slice for a Recipe
 */
export function calculateRecipeCost(
  ingredients: { unitCost: number; quantityUsed: number }[],
  yieldSlices: number,
  overheadPercent: number,
  wrapCostPerSlice: number,
  labelCostPerSlice: number,
  outerBoxCost: number
): RecipeCostBreakdown {
  // Raw ingredients sum
  const rawIngredientsCost = ingredients.reduce(
    (sum, item) => sum + item.unitCost * item.quantityUsed,
    0
  );

  // Operational overhead (utilities, sanitation, oven gas/electricity)
  const overheadBufferCost = rawIngredientsCost * overheadPercent;

  // Dedicated packaging per slice
  const slicePackagingTotal = (wrapCostPerSlice + labelCostPerSlice) * yieldSlices;

  // Total batch cost including 1 outer transport box
  const totalBatchCost = rawIngredientsCost + overheadBufferCost + slicePackagingTotal + outerBoxCost;

  // Single unit landed cost
  const costPerSlice = totalBatchCost / yieldSlices;

  return {
    rawIngredientsCost: Number(rawIngredientsCost.toFixed(2)),
    overheadBufferCost: Number(overheadBufferCost.toFixed(2)),
    slicePackagingTotal: Number(slicePackagingTotal.toFixed(2)),
    outerBoxCost: Number(outerBoxCost.toFixed(2)),
    totalBatchCost: Number(totalBatchCost.toFixed(2)),
    costPerSlice: Number(costPerSlice.toFixed(3)),
  };
}

/**
 * 3. Batch Code Generator
 * Format: #[PREFIX]-[YYMMDD] (e.g. VS-260922)
 */
export function generateBatchCode(skuPrefix: string, deliveryDate: Date): string {
  const dateObj = new Date(deliveryDate);
  const yy = dateObj.getFullYear().toString().slice(-2);
  const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const dd = dateObj.getDate().toString().padStart(2, '0');
  return `${skuPrefix.toUpperCase()}-${yy}${mm}${dd}`;
}

/**
 * 4. Expiry Calculator
 */
export function calculateExpiryDate(deliveryDate: Date, shelfLifeDays: number): Date {
  const expiry = new Date(deliveryDate);
  expiry.setDate(expiry.getDate() + shelfLifeDays);
  return expiry;
}

/**
 * 5. Invoice Reference Generator
 * Format: #JB-YYYY-XXXX (e.g., #JB-2026-0042)
 */
export function generateInvoiceRef(orderIndex: number, date: Date): string {
  const year = date.getFullYear();
  const sequence = orderIndex.toString().padStart(4, '0');
  return `JB-${year}-${sequence}`;
}
