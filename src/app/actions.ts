'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  calculateRawMaterialUnitCost,
  calculateRecipeCost,
  generateBatchCode,
  calculateExpiryDate,
  generateInvoiceRef,
} from '@/lib/calculations';
import { MaterialCategory, OrderStatus, PaymentMethod } from '@/types';

// ==========================================
// 1. RAW MATERIALS ACTIONS
// ==========================================

export async function getRawMaterials() {
  return prisma.rawMaterial.findMany({
    orderBy: { name: 'asc' },
    include: {
      recipeIngredients: {
        include: {
          recipe: {
            select: { name: true },
          },
        },
      },
    },
  });
}

export async function createRawMaterial(formData: {
  name: string;
  category: string;
  purchaseQuantity: number;
  purchaseUnit: string;
  purchaseCost: number;
}) {
  const unitCost = calculateRawMaterialUnitCost(
    formData.purchaseCost,
    formData.purchaseQuantity
  );

  const material = await prisma.rawMaterial.create({
    data: {
      name: formData.name.trim(),
      category: formData.category,
      purchaseQuantity: formData.purchaseQuantity,
      purchaseUnit: formData.purchaseUnit.trim(),
      purchaseCost: formData.purchaseCost,
      unitCost,
    },
  });

  revalidatePath('/cost-library');
  revalidatePath('/recipes');
  revalidatePath('/');
  return material;
}

export async function updateRawMaterial(
  id: string,
  formData: {
    name: string;
    category: string;
    purchaseQuantity: number;
    purchaseUnit: string;
    purchaseCost: number;
  }
) {
  const unitCost = calculateRawMaterialUnitCost(
    formData.purchaseCost,
    formData.purchaseQuantity
  );

  const material = await prisma.rawMaterial.update({
    where: { id },
    data: {
      name: formData.name.trim(),
      category: formData.category,
      purchaseQuantity: formData.purchaseQuantity,
      purchaseUnit: formData.purchaseUnit.trim(),
      purchaseCost: formData.purchaseCost,
      unitCost,
    },
  });

  // Updating an ingredient price triggers immediate real-time recalculation across dependent recipes
  revalidatePath('/cost-library');
  revalidatePath('/recipes');
  revalidatePath('/');
  return material;
}

export async function deleteRawMaterial(id: string) {
  const material = await prisma.rawMaterial.delete({
    where: { id },
  });

  revalidatePath('/cost-library');
  revalidatePath('/recipes');
  return material;
}

// ==========================================
// 2. RECIPES ACTIONS
// ==========================================

export async function getRecipes() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { name: 'asc' },
    include: {
      ingredients: {
        include: {
          rawMaterial: true,
        },
      },
    },
  });

  return recipes.map((recipe) => {
    const costBreakdown = calculateRecipeCost(
      recipe.ingredients.map((ing) => ({
        unitCost: ing.rawMaterial.unitCost,
        quantityUsed: ing.quantityUsed,
      })),
      recipe.yieldSlices,
      recipe.overheadPercent,
      recipe.wrapCostPerSlice,
      recipe.labelCostPerSlice,
      recipe.outerBoxCost
    );

    return {
      ...recipe,
      costBreakdown,
    };
  });
}

export async function getRecipe(id: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: {
          rawMaterial: true,
        },
      },
    },
  });

  if (!recipe) return null;

  const costBreakdown = calculateRecipeCost(
    recipe.ingredients.map((ing) => ({
      unitCost: ing.rawMaterial.unitCost,
      quantityUsed: ing.quantityUsed,
    })),
    recipe.yieldSlices,
    recipe.overheadPercent,
    recipe.wrapCostPerSlice,
    recipe.labelCostPerSlice,
    recipe.outerBoxCost
  );

  return {
    ...recipe,
    costBreakdown,
  };
}

export async function createRecipe(formData: {
  name: string;
  skuPrefix: string;
  description?: string;
  yieldSlices: number;
  ovenMinutes: number;
  shelfLifeDays: number;
  overheadPercent: number;
  outerBoxCost: number;
  wrapCostPerSlice: number;
  labelCostPerSlice: number;
  ingredients: { rawMaterialId: string; quantityUsed: number }[];
}) {
  const recipe = await prisma.recipe.create({
    data: {
      name: formData.name.trim(),
      skuPrefix: formData.skuPrefix.trim().toUpperCase(),
      description: formData.description?.trim() || null,
      yieldSlices: formData.yieldSlices,
      ovenMinutes: formData.ovenMinutes,
      shelfLifeDays: formData.shelfLifeDays,
      overheadPercent: formData.overheadPercent,
      outerBoxCost: formData.outerBoxCost,
      wrapCostPerSlice: formData.wrapCostPerSlice,
      labelCostPerSlice: formData.labelCostPerSlice,
      ingredients: {
        create: formData.ingredients.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          quantityUsed: item.quantityUsed,
        })),
      },
    },
  });

  revalidatePath('/recipes');
  revalidatePath('/orders/new');
  return recipe;
}

export async function updateRecipe(
  id: string,
  formData: {
    name: string;
    skuPrefix: string;
    description?: string;
    yieldSlices: number;
    ovenMinutes: number;
    shelfLifeDays: number;
    overheadPercent: number;
    outerBoxCost: number;
    wrapCostPerSlice: number;
    labelCostPerSlice: number;
    ingredients: { rawMaterialId: string; quantityUsed: number }[];
  }
) {
  // Delete existing ingredients and re-create
  await prisma.recipeIngredient.deleteMany({
    where: { recipeId: id },
  });

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      name: formData.name.trim(),
      skuPrefix: formData.skuPrefix.trim().toUpperCase(),
      description: formData.description?.trim() || null,
      yieldSlices: formData.yieldSlices,
      ovenMinutes: formData.ovenMinutes,
      shelfLifeDays: formData.shelfLifeDays,
      overheadPercent: formData.overheadPercent,
      outerBoxCost: formData.outerBoxCost,
      wrapCostPerSlice: formData.wrapCostPerSlice,
      labelCostPerSlice: formData.labelCostPerSlice,
      ingredients: {
        create: formData.ingredients.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          quantityUsed: item.quantityUsed,
        })),
      },
    },
  });

  revalidatePath('/recipes');
  revalidatePath(`/recipes/${id}`);
  revalidatePath('/orders/new');
  return recipe;
}

export async function deleteRecipe(id: string) {
  const recipe = await prisma.recipe.delete({
    where: { id },
  });

  revalidatePath('/recipes');
  revalidatePath('/orders/new');
  return recipe;
}

// ==========================================
// 3. CAFES ACTIONS
// ==========================================

export async function getCafes() {
  const cafes = await prisma.cafe.findMany({
    orderBy: { name: 'asc' },
    include: {
      orders: {
        select: {
          id: true,
          status: true,
          totalRevenue: true,
          deliveryDate: true,
          invoiceRef: true,
        },
      },
    },
  });

  return cafes.map((cafe) => {
    const totalOrdersCount = cafe.orders.length;
    const lifetimeRevenue = cafe.orders.reduce(
      (sum, ord) => sum + ord.totalRevenue,
      0
    );
    // Unpaid orders: not PAID and not CANCELLED
    const outstandingBalance = cafe.orders
      .filter(
        (ord) =>
          ord.status !== OrderStatus.PAID && ord.status !== OrderStatus.CANCELLED
      )
      .reduce((sum, ord) => sum + ord.totalRevenue, 0);

    return {
      ...cafe,
      totalOrdersCount,
      lifetimeRevenue: Number(lifetimeRevenue.toFixed(2)),
      outstandingBalance: Number(outstandingBalance.toFixed(2)),
    };
  });
}

export async function createCafe(formData: {
  name: string;
  branch: string;
  contactPerson: string;
  phone: string;
  clientCode: string;
  defaultPaymentMethod: string;
  defaultPricePerSlice: number;
}) {
  const cafe = await prisma.cafe.create({
    data: {
      name: formData.name.trim(),
      branch: formData.branch.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      clientCode: formData.clientCode.trim().toUpperCase(),
      defaultPaymentMethod: formData.defaultPaymentMethod,
      defaultPricePerSlice: formData.defaultPricePerSlice,
    },
  });

  revalidatePath('/cafes');
  revalidatePath('/orders/new');
  return cafe;
}

export async function updateCafe(
  id: string,
  formData: {
    name: string;
    branch: string;
    contactPerson: string;
    phone: string;
    clientCode: string;
    defaultPaymentMethod: string;
    defaultPricePerSlice: number;
  }
) {
  const cafe = await prisma.cafe.update({
    where: { id },
    data: {
      name: formData.name.trim(),
      branch: formData.branch.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      clientCode: formData.clientCode.trim().toUpperCase(),
      defaultPaymentMethod: formData.defaultPaymentMethod,
      defaultPricePerSlice: formData.defaultPricePerSlice,
    },
  });

  revalidatePath('/cafes');
  revalidatePath('/orders/new');
  return cafe;
}

export async function deleteCafe(id: string) {
  const cafe = await prisma.cafe.delete({
    where: { id },
  });

  revalidatePath('/cafes');
  revalidatePath('/orders/new');
  return cafe;
}

// ==========================================
// 4. ORDERS ACTIONS
// ==========================================

export async function getOrders() {
  return prisma.order.findMany({
    orderBy: { deliveryDate: 'desc' },
    include: {
      cafe: true,
      items: {
        include: {
          recipe: true,
        },
      },
    },
  });
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      cafe: true,
      items: {
        include: {
          recipe: true,
        },
      },
    },
  });
}

export async function createOrder(formData: {
  cafeId: string;
  deliveryDate: string; // ISO or date string
  dispatchTime: string;
  paymentMethod: string;
  paymentTerms: string;
  notes?: string;
  items: {
    recipeId: string;
    loavesOrdered: number;
    pricePerSlice?: number;
  }[];
}) {
  // 1. Validation: Whole loaves only, positive integer >= 1
  for (const item of formData.items) {
    if (
      !Number.isInteger(item.loavesOrdered) ||
      item.loavesOrdered < 1
    ) {
      throw new Error(
        `Invalid loaves quantity: ${item.loavesOrdered}. Only whole positive integers are allowed.`
      );
    }
  }

  // 2. Fetch Cafe and Recipes with current unit costs
  const cafe = await prisma.cafe.findUnique({
    where: { id: formData.cafeId },
  });
  if (!cafe) throw new Error('Cafe not found');

  const recipeIds = formData.items.map((i) => i.recipeId);
  const recipes = await prisma.recipe.findMany({
    where: { id: { in: recipeIds } },
    include: {
      ingredients: {
        include: {
          rawMaterial: true,
        },
      },
    },
  });

  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  const deliveryDate = new Date(formData.deliveryDate);
  const today = new Date();

  // 3. Count total orders to generate next sequence for Invoice Ref
  const totalOrdersCount = await prisma.order.count();
  const invoiceRef = generateInvoiceRef(totalOrdersCount + 1, deliveryDate);

  // 4. Calculate economics for each line item
  let totalLoaves = 0;
  let totalSlices = 0;
  let totalCost = 0;
  let totalRevenue = 0;

  const orderItemsData = formData.items.map((item) => {
    const recipe = recipeMap.get(item.recipeId);
    if (!recipe) throw new Error(`Recipe ${item.recipeId} not found`);

    const costBreakdown = calculateRecipeCost(
      recipe.ingredients.map((ing) => ({
        unitCost: ing.rawMaterial.unitCost,
        quantityUsed: ing.quantityUsed,
      })),
      recipe.yieldSlices,
      recipe.overheadPercent,
      recipe.wrapCostPerSlice,
      recipe.labelCostPerSlice,
      recipe.outerBoxCost
    );

    const loavesOrdered = item.loavesOrdered;
    const yieldPerLoaf = recipe.yieldSlices; // 8 slices
    const itemSlices = loavesOrdered * yieldPerLoaf;
    const pricePerSlice =
      item.pricePerSlice !== undefined
        ? item.pricePerSlice
        : cafe.defaultPricePerSlice;
    const unitCostPerSlice = costBreakdown.costPerSlice;

    const lineCost = Number((itemSlices * unitCostPerSlice).toFixed(2));
    const lineRevenue = Number((itemSlices * pricePerSlice).toFixed(2));
    const lineProfit = Number((lineRevenue - lineCost).toFixed(2));

    const batchCode = generateBatchCode(recipe.skuPrefix, deliveryDate);
    const bestBeforeDate = calculateExpiryDate(
      deliveryDate,
      recipe.shelfLifeDays
    );

    totalLoaves += loavesOrdered;
    totalSlices += itemSlices;
    totalCost += lineCost;
    totalRevenue += lineRevenue;

    return {
      recipeId: recipe.id,
      loavesOrdered,
      yieldPerLoaf,
      totalSlices: itemSlices,
      unitCostPerSlice,
      pricePerSlice,
      lineCost,
      lineRevenue,
      lineProfit,
      batchCode,
      productionDate: today,
      bestBeforeDate,
    };
  });

  const netProfit = Number((totalRevenue - totalCost).toFixed(2));
  const profitMargin =
    totalRevenue > 0
      ? Number(((netProfit / totalRevenue) * 100).toFixed(2))
      : 0;

  const order = await prisma.order.create({
    data: {
      invoiceRef,
      cafeId: cafe.id,
      status: OrderStatus.CONFIRMED,
      paymentMethod: formData.paymentMethod,
      paymentTerms: formData.paymentTerms || 'COD / 3 Days Net',
      orderDate: today,
      deliveryDate,
      dispatchTime: formData.dispatchTime || '07:30 AM Fresh Morning Drop',
      totalLoaves,
      totalSlices,
      totalCost: Number(totalCost.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      netProfit,
      profitMargin,
      notes: formData.notes?.trim() || null,
      items: {
        create: orderItemsData,
      },
    },
  });

  revalidatePath('/orders');
  revalidatePath('/');
  revalidatePath('/cafes');
  return order;
}

export async function updateOrderStatus(id: string, status: string) {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath('/orders');
  revalidatePath(`/orders/${id}`);
  revalidatePath('/');
  revalidatePath('/cafes');
  return order;
}

export async function deleteOrder(id: string) {
  const order = await prisma.order.delete({
    where: { id },
  });

  revalidatePath('/orders');
  revalidatePath('/');
  revalidatePath('/cafes');
  return order;
}

// ==========================================
// 5. DASHBOARD KPIS & DISPATCH SCHEDULE
// ==========================================

export async function getDashboardData() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const tomorrowEnd = new Date(today);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // Month start for gross revenue calculation
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // 1. Today's Deliveries: Total loaves and slices scheduled for today
  const todayOrders = await prisma.order.findMany({
    where: {
      deliveryDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: OrderStatus.CANCELLED,
      },
    },
  });

  const todayLoaves = todayOrders.reduce((sum, o) => sum + o.totalLoaves, 0);
  const todaySlices = todayOrders.reduce((sum, o) => sum + o.totalSlices, 0);

  // 2. Gross Revenue (Current Month): sum of confirmed/active wholesale invoices
  const monthOrders = await prisma.order.findMany({
    where: {
      deliveryDate: {
        gte: startOfMonth,
      },
      status: {
        not: OrderStatus.CANCELLED,
      },
    },
  });

  const grossRevenue = monthOrders.reduce((sum, o) => sum + o.totalRevenue, 0);
  const totalMonthCost = monthOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const netProfit = grossRevenue - totalMonthCost;
  const realizedMargin =
    grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // 3. Unpaid Receivables: Delivered orders pending payment
  const unpaidOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.BAKED],
      },
    },
  });

  const unpaidReceivables = unpaidOrders.reduce(
    (sum, o) => sum + o.totalRevenue,
    0
  );

  // 4. Dispatch Schedule: deliveries for today and tomorrow
  const scheduleOrders = await prisma.order.findMany({
    where: {
      deliveryDate: {
        gte: startOfDay,
        lte: tomorrowEnd,
      },
    },
    include: {
      cafe: true,
      items: {
        include: {
          recipe: true,
        },
      },
    },
    orderBy: { deliveryDate: 'asc' },
  });

  return {
    kpis: {
      todayLoaves,
      todaySlices,
      todayOrdersCount: todayOrders.length,
      grossRevenue: Number(grossRevenue.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      realizedMargin: Number(realizedMargin.toFixed(1)),
      unpaidReceivables: Number(unpaidReceivables.toFixed(2)),
    },
    scheduleOrders,
  };
}
