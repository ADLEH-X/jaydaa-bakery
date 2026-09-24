'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Coffee,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { getCafes, getRecipes, createOrder } from '../../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PaymentMethod } from '@/types';

function NewOrderWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCafeId = searchParams.get('cafeId');

  const [cafes, setCafes] = React.useState<any[]>([]);
  const [recipes, setRecipes] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Step 1: Cafe Selection
  const [selectedCafeId, setSelectedCafeId] = React.useState(preselectedCafeId || '');
  const [agreedPricePerSlice, setAgreedPricePerSlice] = React.useState<number>(1.4);
  const [paymentMethod, setPaymentMethod] = React.useState<string>(PaymentMethod.COD);
  const [paymentTerms, setPaymentTerms] = React.useState('COD / 3 Days Net');

  // Step 2: Delivery & Dispatch Schedule
  // Default to tomorrow 07:30 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [deliveryDate, setDeliveryDate] = React.useState(defaultDateStr);
  const [dispatchTime, setDispatchTime] = React.useState('07:30 AM Fresh Morning Drop');
  const [notes, setNotes] = React.useState('');

  // Step 3: Line Items (Strict Whole Loaves Only)
  const [items, setItems] = React.useState<
    { recipeId: string; loavesOrdered: number; pricePerSlice: number }[]
  >([{ recipeId: '', loavesOrdered: 1, pricePerSlice: 1.4 }]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [cafesData, recipesData] = await Promise.all([
          getCafes(),
          getRecipes(),
        ]);
        setCafes(cafesData);
        setRecipes(recipesData);

        // Pre-select cafe if available
        const initialCafe = preselectedCafeId
          ? cafesData.find((c) => c.id === preselectedCafeId)
          : cafesData[0];

        if (initialCafe) {
          setSelectedCafeId(initialCafe.id);
          setAgreedPricePerSlice(initialCafe.defaultPricePerSlice);
          setPaymentMethod(initialCafe.defaultPaymentMethod);
        }

        // Set initial recipe for first item
        if (recipesData.length > 0) {
          setItems([
            {
              recipeId: recipesData[0].id,
              loavesOrdered: 1,
              pricePerSlice: initialCafe?.defaultPricePerSlice || 1.4,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load initial data for new order:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [preselectedCafeId]);

  // Handle Cafe Change
  const handleCafeChange = (cafeId: string) => {
    setSelectedCafeId(cafeId);
    const cafe = cafes.find((c) => c.id === cafeId);
    if (cafe) {
      setAgreedPricePerSlice(cafe.defaultPricePerSlice);
      setPaymentMethod(cafe.defaultPaymentMethod);
      // Update pricePerSlice for items
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          pricePerSlice: cafe.defaultPricePerSlice,
        }))
      );
    }
  };

  // Add Line Item
  const addLineItem = () => {
    const firstRecipeId = recipes[0]?.id || '';
    setItems((prev) => [
      ...prev,
      {
        recipeId: firstRecipeId,
        loavesOrdered: 1,
        pricePerSlice: agreedPricePerSlice,
      },
    ]);
  };

  // Remove Line Item
  const removeLineItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update Line Item
  const updateLineItem = (
    index: number,
    field: 'recipeId' | 'loavesOrdered' | 'pricePerSlice',
    val: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === 'loavesOrdered') {
        // Strict constraint: whole integer only, at least 1
        const num = Math.max(1, Math.floor(Number(val) || 1));
        updated[index] = { ...updated[index], loavesOrdered: num };
      } else {
        updated[index] = { ...updated[index], [field]: val };
      }
      return updated;
    });
  };

  // Calculations
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  const summary = React.useMemo(() => {
    let totalLoaves = 0;
    let totalSlices = 0;
    let subtotalRevenue = 0;
    let totalInternalCost = 0;

    items.forEach((item) => {
      const recipe = recipeMap.get(item.recipeId);
      if (!recipe) return;

      const slicesPerLoaf = recipe.yieldSlices || 8;
      const itemSlices = item.loavesOrdered * slicesPerLoaf;
      const unitCost = recipe.costBreakdown?.costPerSlice || 0;
      const price = item.pricePerSlice || agreedPricePerSlice;

      totalLoaves += item.loavesOrdered;
      totalSlices += itemSlices;
      subtotalRevenue += itemSlices * price;
      totalInternalCost += itemSlices * unitCost;
    });

    const netMargin = subtotalRevenue - totalInternalCost;
    const marginPercent =
      subtotalRevenue > 0 ? (netMargin / subtotalRevenue) * 100 : 0;

    return {
      totalLoaves,
      totalSlices,
      subtotalRevenue,
      totalInternalCost,
      netMargin,
      marginPercent,
    };
  }, [items, recipeMap, agreedPricePerSlice]);

  // Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCafeId) {
      alert('Please select a coffee shop.');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one loaf to the order.');
      return;
    }

    // Strict validation verification
    for (const item of items) {
      if (!item.recipeId) {
        alert('Please select a recipe for all line items.');
        return;
      }
      if (!Number.isInteger(item.loavesOrdered) || item.loavesOrdered < 1) {
        alert('Loaves must be whole positive integers (1, 2, 3...). Loose slices are not allowed.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        cafeId: selectedCafeId,
        deliveryDate,
        dispatchTime,
        paymentMethod,
        paymentTerms,
        notes,
        items: items.map((it) => ({
          recipeId: it.recipeId,
          loavesOrdered: it.loavesOrdered,
          pricePerSlice: it.pricePerSlice,
        })),
      });

      router.push(`/orders/${order.id}`);
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Error creating order. Please verify your inputs.');
      setIsSubmitting(false);
    }
  };

  const selectedCafe = cafes.find((c) => c.id === selectedCafeId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-bakery-border">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-bakery-espresso sm:text-3xl">
            Order Dispatch & Settlement Wizard
          </h1>
          <p className="text-sm text-bakery-muted mt-0.5">
            Configure fresh morning delivery, snapshot wholesale unit economics, and issue immutable invoice reference.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-bakery-muted text-sm">
          Loading order wizard prerequisites...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: CAFE SELECTION */}
          <Card className="border-bakery-border shadow-sm">
            <CardHeader className="border-b border-bakery-border/60 bg-bakery-cream/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-bakery-espresso flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bakery-espresso text-xs font-bold text-[#f7e8d0]">
                    1
                  </span>
                  Select Partner Coffee Shop
                </CardTitle>
                <Link
                  href="/cafes"
                  className="text-xs font-semibold text-bakery-gold hover:underline"
                >
                  + Register New Cafe
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Coffee Shop Client
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-bakery-border bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bakery-espresso font-medium text-bakery-espresso"
                    value={selectedCafeId}
                    onChange={(e) => handleCafeChange(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Coffee Shop --</option>
                    {cafes.map((cafe) => (
                      <option key={cafe.id} value={cafe.id}>
                        {cafe.name} ({cafe.branch}) • Code: {cafe.clientCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Agreed Price / Slice ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={agreedPricePerSlice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setAgreedPricePerSlice(val);
                      setItems((prev) =>
                        prev.map((it) => ({ ...it, pricePerSlice: val }))
                      );
                    }}
                  />
                </div>
              </div>

              {selectedCafe && (
                <div className="mt-4 p-3 bg-bakery-cream/60 rounded-lg border border-bakery-border flex flex-wrap items-center justify-between text-xs text-bakery-muted gap-2">
                  <div>
                    <strong className="text-bakery-espresso">Manager / Contact:</strong>{' '}
                    {selectedCafe.contactPerson} ({selectedCafe.phone})
                  </div>
                  <div>
                    <strong className="text-bakery-espresso">Client Account:</strong>{' '}
                    <span className="font-mono font-bold text-bakery-espresso">
                      {selectedCafe.clientCode}
                    </span>
                  </div>
                  <div>
                    <strong className="text-bakery-espresso">Payment Terms:</strong>{' '}
                    <span className="font-semibold text-bakery-espresso">
                      {selectedCafe.defaultPaymentMethod}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2: DELIVERY & DISPATCH SCHEDULE */}
          <Card className="border-bakery-border shadow-sm">
            <CardHeader className="border-b border-bakery-border/60 bg-bakery-cream/30 px-6 py-4">
              <CardTitle className="text-base font-bold text-bakery-espresso flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bakery-espresso text-xs font-bold text-[#f7e8d0]">
                  2
                </span>
                Fulfillment & Dispatch Logistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-bakery-gold" /> Delivery Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-bakery-gold" /> Dispatch Time Window
                  </label>
                  <Input
                    required
                    value={dispatchTime}
                    onChange={(e) => setDispatchTime(e.target.value)}
                    placeholder="e.g. 07:30 AM Fresh Morning Drop"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Payment Method
                  </label>
                  <select
                    className="flex h-9 w-full rounded-md border border-bakery-border bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bakery-espresso"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value={PaymentMethod.COD}>COD (Cash On Delivery)</option>
                    <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                    <option value={PaymentMethod.STC_PAY}>STC Pay</option>
                    <option value={PaymentMethod.NET_7_DAYS}>Net 7 Days Credit</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <label className="text-xs font-semibold text-bakery-espresso">
                  Delivery Notes & Instructions (Optional)
                </label>
                <Input
                  placeholder="e.g. Leave with morning barista; inspect seal before sign-off."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* STEP 3: WHOLE-LOAF LINE ITEMS SELECTOR */}
          <Card className="border-bakery-border shadow-sm">
            <CardHeader className="border-b border-bakery-border/60 bg-bakery-cream/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-bakery-espresso flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bakery-espresso text-xs font-bold text-[#f7e8d0]">
                      3
                    </span>
                    Line Items Selector (Whole Loaves Only)
                  </CardTitle>
                  <CardDescription className="text-xs text-bakery-muted mt-0.5">
                    Strict constraint: Orders must be in whole loaf multiples (1 loaf = 8 pre-sliced & sealed portions). Loose slices are rejected.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addLineItem}
                  className="h-8 text-xs gap-1 border-bakery-border"
                >
                  <Plus className="h-3.5 w-3.5 text-bakery-gold" /> Add Loaf
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {items.map((item, idx) => {
                const recipe = recipeMap.get(item.recipeId);
                const slicesPerLoaf = recipe?.yieldSlices || 8;
                const totalSlices = item.loavesOrdered * slicesPerLoaf;
                const lineRevenue = totalSlices * item.pricePerSlice;
                const unitCost = recipe?.costBreakdown?.costPerSlice || 0;
                const lineCost = totalSlices * unitCost;
                const lineProfit = lineRevenue - lineCost;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-bakery-border bg-white shadow-xs space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-5 space-y-1">
                        <label className="text-xs font-medium text-bakery-muted">
                          Product / Recipe
                        </label>
                        <select
                          className="h-10 w-full rounded-md border border-bakery-border bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bakery-espresso font-semibold text-bakery-espresso"
                          value={item.recipeId}
                          onChange={(e) =>
                            updateLineItem(idx, 'recipeId', e.target.value)
                          }
                          required
                        >
                          <option value="">-- Select Recipe --</option>
                          {recipes.map((r) => (
                            <option key={r.id} value={r.id}>
                              [{r.skuPrefix}] {r.name} ({r.yieldSlices} slices/loaf)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-bakery-muted flex items-center justify-between">
                          <span>Loaves</span>
                          <span className="text-[10px] text-bakery-gold font-semibold">
                            Whole &ge; 1
                          </span>
                        </label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={item.loavesOrdered}
                          onChange={(e) =>
                            updateLineItem(idx, 'loavesOrdered', e.target.value)
                          }
                          className="h-10 text-center font-bold text-bakery-espresso"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-bakery-muted">
                          Price / Slice ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.1"
                          required
                          value={item.pricePerSlice}
                          onChange={(e) =>
                            updateLineItem(
                              idx,
                              'pricePerSlice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-10 text-right font-mono font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2 text-right space-y-1">
                        <span className="text-xs font-medium text-bakery-muted block">
                          Line Subtotal
                        </span>
                        <div className="font-mono text-base font-extrabold text-bakery-espresso">
                          {formatCurrency(lineRevenue)}
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeLineItem(idx)}
                          disabled={items.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Unit Economics Live Preview Pill */}
                    {recipe && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-bakery-border/50 text-xs bg-bakery-cream/40 px-3 py-1.5 rounded-md">
                        <div>
                          <span className="text-bakery-muted">Portion Yield:</span>{' '}
                          <strong className="text-bakery-espresso">
                            {totalSlices} individual slices
                          </strong>{' '}
                          ({item.loavesOrdered} loaf &times; {slicesPerLoaf} pcs)
                        </div>
                        <div>
                          <span className="text-bakery-muted">Landed Unit Cost:</span>{' '}
                          <span className="font-mono font-semibold text-bakery-espresso">
                            ${unitCost.toFixed(3)}/slice
                          </span>
                        </div>
                        <div>
                          <span className="text-bakery-muted">Line Net Margin:</span>{' '}
                          <span className="font-mono font-bold text-emerald-700">
                            +{formatCurrency(lineProfit)} (
                            {lineRevenue > 0
                              ? ((lineProfit / lineRevenue) * 100).toFixed(1)
                              : 0}
                            %)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* STEP 4: FINANCIAL SUMMARY & SUBMISSION */}
          <div className="rounded-xl border border-bakery-border bg-amber-50/50 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bakery-espresso text-xs font-bold text-[#f7e8d0]">
                  4
                </span>
                <span className="text-sm font-bold uppercase tracking-wider text-bakery-espresso">
                  Order Settlement & Financial Rollup
                </span>
              </div>
              <Badge variant="gold" className="font-mono text-xs">
                Free Scheduled B2B Delivery
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white border border-bakery-border rounded-lg">
                <span className="text-xs text-bakery-muted block">Total Loaves:</span>
                <span className="text-xl font-extrabold text-bakery-espresso">
                  {summary.totalLoaves} Loaves
                </span>
              </div>
              <div className="p-3 bg-white border border-bakery-border rounded-lg">
                <span className="text-xs text-bakery-muted block">Wrapped Slices:</span>
                <span className="text-xl font-extrabold text-bakery-espresso">
                  {summary.totalSlices} Slices
                </span>
              </div>
              <div className="p-3 bg-white border border-bakery-border rounded-lg">
                <span className="text-xs text-bakery-muted block">Internal Cost:</span>
                <span className="text-xl font-mono font-bold text-bakery-muted">
                  {formatCurrency(summary.totalInternalCost)}
                </span>
              </div>
              <div className="p-3 bg-bakery-espresso text-white rounded-lg shadow-sm">
                <span className="text-xs text-[#f7e8d0] block">TOTAL DUE (Billed):</span>
                <span className="text-2xl font-mono font-extrabold text-[#f7e8d0]">
                  {formatCurrency(summary.subtotalRevenue)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 text-xs text-bakery-muted gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>
                  Realized Net Profit:{' '}
                  <strong className="text-emerald-700 font-mono text-sm">
                    +{formatCurrency(summary.netMargin)} ({summary.marginPercent.toFixed(1)}%)
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/orders">
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  disabled={isSubmitting}
                  className="font-bold gap-2 shadow"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {isSubmitting ? 'Generating Invoice...' : 'Confirm & Dispatch Order'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-bakery-muted text-sm">
          Loading order wizard...
        </div>
      }
    >
      <NewOrderWizard />
    </React.Suspense>
  );
}
