export enum MaterialCategory {
  INGREDIENT = 'INGREDIENT',
  PACKAGING = 'PACKAGING',
  OVERHEAD = 'OVERHEAD',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  BAKED = 'BAKED',
  DELIVERED = 'DELIVERED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  STC_PAY = 'STC_PAY',
  NET_7_DAYS = 'NET_7_DAYS',
}

export interface RecipeCostBreakdown {
  rawIngredientsCost: number;
  overheadBufferCost: number;
  slicePackagingTotal: number;
  outerBoxCost: number;
  totalBatchCost: number;
  costPerSlice: number;
}

export interface RawMaterialWithRelations {
  id: string;
  name: string;
  category: MaterialCategory | string;
  purchaseQuantity: number;
  purchaseUnit: string;
  purchaseCost: number;
  unitCost: number;
  updatedAt: Date;
  createdAt: Date;
  recipeIngredients?: {
    id: string;
    recipeId: string;
    quantityUsed: number;
    recipe?: {
      name: string;
    };
  }[];
}

export interface RecipeIngredientDetail {
  id: string;
  recipeId: string;
  rawMaterialId: string;
  quantityUsed: number;
  rawMaterial: {
    id: string;
    name: string;
    category: string;
    purchaseUnit: string;
    unitCost: number;
  };
}

export interface RecipeWithIngredients {
  id: string;
  name: string;
  skuPrefix: string;
  description: string | null;
  yieldSlices: number;
  ovenMinutes: number;
  shelfLifeDays: number;
  overheadPercent: number;
  outerBoxCost: number;
  wrapCostPerSlice: number;
  labelCostPerSlice: number;
  createdAt: Date;
  updatedAt: Date;
  ingredients: RecipeIngredientDetail[];
  costBreakdown?: RecipeCostBreakdown;
}

export interface CafeWithOrders {
  id: string;
  name: string;
  branch: string;
  contactPerson: string;
  phone: string;
  clientCode: string;
  defaultPaymentMethod: PaymentMethod | string;
  defaultPricePerSlice: number;
  createdAt: Date;
  updatedAt: Date;
  orders?: OrderDetail[];
  totalOrdersCount?: number;
  lifetimeRevenue?: number;
  outstandingBalance?: number;
}

export interface OrderItemDetail {
  id: string;
  orderId: string;
  recipeId: string;
  loavesOrdered: number;
  yieldPerLoaf: number;
  totalSlices: number;
  unitCostPerSlice: number;
  pricePerSlice: number;
  lineCost: number;
  lineRevenue: number;
  lineProfit: number;
  batchCode: string;
  productionDate: Date;
  bestBeforeDate: Date;
  recipe: {
    id: string;
    name: string;
    skuPrefix: string;
    shelfLifeDays: number;
  };
}

export interface OrderDetail {
  id: string;
  invoiceRef: string;
  cafeId: string;
  status: OrderStatus | string;
  paymentMethod: PaymentMethod | string;
  paymentTerms: string;
  orderDate: Date;
  deliveryDate: Date;
  dispatchTime: string;
  totalLoaves: number;
  totalSlices: number;
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  cafe: {
    id: string;
    name: string;
    branch: string;
    contactPerson: string;
    phone: string;
    clientCode: string;
    defaultPricePerSlice: number;
    defaultPaymentMethod: string;
  };
  items: OrderItemDetail[];
}
