import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { getRecipe } from '../../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const recipe = await getRecipe(params.id);

  if (!recipe) {
    notFound();
  }

  const breakdown = recipe.costBreakdown;
  const suggestedWholesale = breakdown.costPerSlice / 0.5; // 50% target margin

  return (
    <div className="space-y-6">
      {/* Back link & Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/recipes">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-bakery-border">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-mono text-xs">
                {recipe.skuPrefix}
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-bakery-espresso">
                {recipe.name}
              </h1>
            </div>
            <p className="text-xs text-bakery-muted mt-0.5">
              {recipe.description || 'Pre-portioned wholesale bakery product'}
            </p>
          </div>
        </div>

        <Link href="/orders/new">
          <Button variant="gold" className="gap-1.5 font-semibold">
            Order This Recipe
          </Button>
        </Link>
      </div>

      {/* Loaf Economics Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-bakery-border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold uppercase text-bakery-muted">
              Batch Yield
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-bakery-espresso">
              {recipe.yieldSlices} Slices
            </div>
            <div className="text-xs text-bakery-muted mt-0.5">
              {recipe.ovenMinutes} min bake • {recipe.shelfLifeDays}d shelf life
            </div>
          </CardContent>
        </Card>

        <Card className="border-bakery-border shadow-xs">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold uppercase text-bakery-muted">
              Total Batch Cost
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-bakery-espresso">
              {formatCurrency(breakdown.totalBatchCost)}
            </div>
            <div className="text-xs text-bakery-muted mt-0.5">
              Includes box & 12% overhead
            </div>
          </CardContent>
        </Card>

        <Card className="border-bakery-border shadow-xs bg-amber-50/40">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold uppercase text-bakery-darkMuted">
              Landed Cost / Slice
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-mono font-extrabold text-bakery-espresso">
              ${breakdown.costPerSlice.toFixed(3)}
            </div>
            <div className="text-xs text-bakery-muted mt-0.5">
              Base unit production cost
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-xs bg-emerald-50/40">
          <CardHeader className="p-4 pb-1">
            <CardDescription className="text-xs font-semibold uppercase text-emerald-800">
              Suggested Wholesale (50%)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-mono font-extrabold text-emerald-700">
              ${suggestedWholesale.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-700 mt-0.5">
              ${(suggestedWholesale * recipe.yieldSlices).toFixed(2)} / full loaf
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Architecture Breakdown */}
      <Card className="border-bakery-border shadow-sm">
        <CardHeader className="border-b border-bakery-border/60 bg-bakery-cream/30 px-6 py-4">
          <CardTitle className="text-base font-bold text-bakery-espresso flex items-center gap-2">
            <Layers className="h-4 w-4 text-bakery-gold" />
            Cost Architecture & Operational Allocations
          </CardTitle>
          <CardDescription className="text-xs text-bakery-muted">
            Formula: Raw Ingredients + Operational Overhead (12%) + Packaging Pouches + Outer Box = Batch Total
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-white border border-bakery-border rounded-lg">
              <span className="text-xs text-bakery-muted block">Raw Ingredients:</span>
              <span className="text-base font-bold text-bakery-espresso font-mono">
                {formatCurrency(breakdown.rawIngredientsCost)}
              </span>
            </div>
            <div className="p-3 bg-white border border-bakery-border rounded-lg">
              <span className="text-xs text-bakery-muted block">
                Overhead Buffer ({(recipe.overheadPercent * 100).toFixed(0)}%):
              </span>
              <span className="text-base font-bold text-bakery-espresso font-mono">
                {formatCurrency(breakdown.overheadBufferCost)}
              </span>
            </div>
            <div className="p-3 bg-white border border-bakery-border rounded-lg">
              <span className="text-xs text-bakery-muted block">
                Slice Packaging ({recipe.yieldSlices} pcs):
              </span>
              <span className="text-base font-bold text-bakery-espresso font-mono">
                {formatCurrency(breakdown.slicePackagingTotal)}
              </span>
              <span className="text-[11px] text-bakery-muted block mt-0.5">
                Wrap: ${recipe.wrapCostPerSlice} • Label: ${recipe.labelCostPerSlice}
              </span>
            </div>
            <div className="p-3 bg-white border border-bakery-border rounded-lg">
              <span className="text-xs text-bakery-muted block">Outer Transport Box:</span>
              <span className="text-base font-bold text-bakery-espresso font-mono">
                {formatCurrency(breakdown.outerBoxCost)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Ingredients Table */}
      <Card className="border-bakery-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-bakery-border/60 bg-white px-6 py-4">
          <CardTitle className="text-base font-bold text-bakery-espresso flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-bakery-gold" />
            Recipe Ingredients Formulation
          </CardTitle>
          <CardDescription className="text-xs text-bakery-muted">
            Raw material requirements and dynamic cost contributions per batch.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-bakery-cream/60">
                <TableHead>Ingredient Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity Required</TableHead>
                <TableHead className="text-right">Current Market Unit Cost</TableHead>
                <TableHead className="text-right">Line Batch Cost</TableHead>
                <TableHead className="text-right">% of Raw Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipe.ingredients.map((ing) => {
                const lineCost = ing.quantityUsed * ing.rawMaterial.unitCost;
                const percentOfRaw =
                  breakdown.rawIngredientsCost > 0
                    ? ((lineCost / breakdown.rawIngredientsCost) * 100).toFixed(1)
                    : '0';

                return (
                  <TableRow key={ing.id} className="hover:bg-bakery-cream/30">
                    <TableCell className="font-semibold text-bakery-espresso">
                      {ing.rawMaterial.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">
                        {ing.rawMaterial.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm text-bakery-espresso">
                      {ing.quantityUsed.toLocaleString()} {ing.rawMaterial.purchaseUnit}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-bakery-muted">
                      ${ing.rawMaterial.unitCost.toFixed(5)} / {ing.rawMaterial.purchaseUnit}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-sm text-bakery-espresso">
                      ${lineCost.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs text-bakery-muted">
                      {percentOfRaw}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
