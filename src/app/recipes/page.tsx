'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  Percent,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { getRecipes, getRawMaterials, createRecipe, deleteRecipe } from '../actions';
import { calculateRecipeCost } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';

export default function RecipesPage() {
  const [recipes, setRecipes] = React.useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Builder Form State
  const [name, setName] = React.useState('');
  const [skuPrefix, setSkuPrefix] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [yieldSlices, setYieldSlices] = React.useState(8);
  const [ovenMinutes, setOvenMinutes] = React.useState(25);
  const [shelfLifeDays, setShelfLifeDays] = React.useState(4);
  const [overheadPercent, setOverheadPercent] = React.useState(0.0);
  const [outerBoxCost, setOuterBoxCost] = React.useState(0.0);
  const [wrapCostPerSlice, setWrapCostPerSlice] = React.useState(0.0);
  const [labelCostPerSlice, setLabelCostPerSlice] = React.useState(0.0);

  // Dynamic Ingredients in Builder
  const [builderIngredients, setBuilderIngredients] = React.useState<
    { rawMaterialId: string; quantityUsed: number }[]
  >([{ rawMaterialId: '', quantityUsed: 0 }]);

  // Margin Slider State (30% to 70%)
  const [targetMargin, setTargetMargin] = React.useState(50);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [recipesData, materialsData] = await Promise.all([
        getRecipes(),
        getRawMaterials(),
      ]);
      setRecipes(recipesData);
      setRawMaterials(materialsData);
      if (materialsData.length > 0 && builderIngredients[0].rawMaterialId === '') {
        setBuilderIngredients([{ rawMaterialId: materialsData[0].id, quantityUsed: 100 }]);
      }
    } catch (err) {
      console.error('Failed to load recipe data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Live calculation of Builder costs with every keystroke
  const liveCostBreakdown = React.useMemo(() => {
    const ingMap = new Map(rawMaterials.map((m) => [m.id, m]));
    const formattedIngredients = builderIngredients
      .filter((bi) => bi.rawMaterialId && bi.quantityUsed > 0)
      .map((bi) => {
        const mat = ingMap.get(bi.rawMaterialId);
        return {
          unitCost: mat ? mat.unitCost : 0,
          quantityUsed: bi.quantityUsed,
        };
      });

    return calculateRecipeCost(
      formattedIngredients,
      yieldSlices > 0 ? yieldSlices : 8,
      overheadPercent,
      wrapCostPerSlice,
      labelCostPerSlice,
      outerBoxCost
    );
  }, [
    builderIngredients,
    rawMaterials,
    yieldSlices,
    overheadPercent,
    wrapCostPerSlice,
    labelCostPerSlice,
    outerBoxCost,
  ]);

  // Suggested wholesale price per slice based on margin slider: Cost / (1 - margin)
  const suggestedPricePerSlice = React.useMemo(() => {
    const marginRatio = targetMargin / 100;
    if (marginRatio >= 1) return liveCostBreakdown.costPerSlice * 2;
    return liveCostBreakdown.costPerSlice / (1 - marginRatio);
  }, [liveCostBreakdown.costPerSlice, targetMargin]);

  const addIngredientRow = () => {
    const firstMaterialId = rawMaterials[0]?.id || '';
    setBuilderIngredients((prev) => [
      ...prev,
      { rawMaterialId: firstMaterialId, quantityUsed: 0 },
    ]);
  };

  const removeIngredientRow = (index: number) => {
    setBuilderIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredientRow = (
    index: number,
    field: 'rawMaterialId' | 'quantityUsed',
    value: any
  ) => {
    setBuilderIngredients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !skuPrefix.trim()) return;

    const validIngredients = builderIngredients.filter(
      (bi) => bi.rawMaterialId && bi.quantityUsed > 0
    );
    if (validIngredients.length === 0) {
      alert('Please add at least one ingredient with a quantity > 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRecipe({
        name: name.trim(),
        skuPrefix: skuPrefix.trim().toUpperCase(),
        description: description.trim(),
        yieldSlices: Number(yieldSlices),
        ovenMinutes: Number(ovenMinutes),
        shelfLifeDays: Number(shelfLifeDays),
        overheadPercent: Number(overheadPercent),
        outerBoxCost: Number(outerBoxCost),
        wrapCostPerSlice: Number(wrapCostPerSlice),
        labelCostPerSlice: Number(labelCostPerSlice),
        ingredients: validIngredients.map((ing) => ({
          rawMaterialId: ing.rawMaterialId,
          quantityUsed: Number(ing.quantityUsed),
        })),
      });

      setIsBuilderOpen(false);
      setName('');
      setSkuPrefix('');
      setDescription('');
      await loadData();
    } catch (err) {
      console.error('Failed to create recipe:', err);
      alert('Failed to save recipe. Please make sure the name is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecipe = async (id: string, recipeName: string) => {
    if (!confirm(`Are you sure you want to delete "${recipeName}"?`)) return;
    try {
      await deleteRecipe(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      alert('Cannot delete recipe if it is attached to existing orders.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-bakery-espresso sm:text-3xl">
            Recipe Master & Margin Builder
          </h1>
          <p className="text-sm text-bakery-muted mt-1">
            Formulate loaf recipes, monitor 12% operational buffers, and dynamically simulate target wholesale margins.
          </p>
        </div>
        <Button
          onClick={() => setIsBuilderOpen(!isBuilderOpen)}
          variant="gold"
          className="gap-2 font-semibold shadow"
        >
          <Plus className="h-4 w-4" />
          {isBuilderOpen ? 'Hide Builder' : 'New Recipe Builder'}
        </Button>
      </div>

      {/* Interactive Builder Form (Collapsible) */}
      {isBuilderOpen && (
        <Card className="border-2 border-bakery-gold/40 shadow-md bg-white">
          <CardHeader className="border-b border-bakery-border/60 bg-bakery-cream/30 px-6 py-4">
            <CardTitle className="text-lg font-bold text-bakery-espresso flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-bakery-gold" />
              Interactive Recipe Formulator & Margin Simulator
            </CardTitle>
            <CardDescription className="text-xs text-bakery-muted">
              Live arithmetic calculation updates with each keystroke including packaging pouches, outer box, and overhead.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleCreateRecipe} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Recipe Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Classic Vanilla Sponge Loaf"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    SKU Prefix (2-4 Letters)
                  </label>
                  <Input
                    required
                    maxLength={4}
                    placeholder="e.g. VS"
                    value={skuPrefix}
                    onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Loaf Specs */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Yield (Slices / Loaf)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={yieldSlices}
                    onChange={(e) => setYieldSlices(parseInt(e.target.value) || 8)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Oven Time (Minutes)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={ovenMinutes}
                    onChange={(e) => setOvenMinutes(parseInt(e.target.value) || 35)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Shelf Life (Days)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={shelfLifeDays}
                    onChange={(e) => setShelfLifeDays(parseInt(e.target.value) || 5)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Overhead Buffer (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={overheadPercent}
                    onChange={(e) => setOverheadPercent(parseFloat(e.target.value) || 0.12)}
                  />
                </div>
              </div>

              {/* Packaging Costs */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 bg-bakery-cream/50 p-3 rounded-lg border border-bakery-border">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-bakery-espresso">
                    Seal Wrap / Slice ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={wrapCostPerSlice}
                    onChange={(e) => setWrapCostPerSlice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-bakery-espresso">
                    Allergen Label / Slice ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={labelCostPerSlice}
                    onChange={(e) => setLabelCostPerSlice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-bakery-espresso">
                    Outer Transport Box ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={outerBoxCost}
                    onChange={(e) => setOuterBoxCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Ingredients Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-bakery-espresso">
                    Raw Ingredients & Portions
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addIngredientRow}
                    className="h-7 text-xs gap-1 border-bakery-border"
                  >
                    <Plus className="h-3.5 w-3.5 text-bakery-gold" /> Add Ingredient
                  </Button>
                </div>

                <div className="space-y-2">
                  {builderIngredients.map((row, idx) => {
                    const selectedMat = rawMaterials.find((m) => m.id === row.rawMaterialId);
                    const rowCost =
                      selectedMat && row.quantityUsed > 0
                        ? (selectedMat.unitCost * row.quantityUsed).toFixed(3)
                        : '0.000';

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-lg border border-bakery-border shadow-xs"
                      >
                        <div className="flex-1">
                          <select
                            className="h-9 w-full rounded-md border border-bakery-border bg-white px-3 py-1 text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bakery-espresso"
                            value={row.rawMaterialId}
                            onChange={(e) =>
                              updateIngredientRow(idx, 'rawMaterialId', e.target.value)
                            }
                          >
                            <option value="">-- Select Material --</option>
                            {rawMaterials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} (${m.unitCost.toFixed(5)}/{m.purchaseUnit})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full sm:w-36 flex items-center gap-1">
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Qty used"
                            className="h-9 text-xs"
                            value={row.quantityUsed || ''}
                            onChange={(e) =>
                              updateIngredientRow(
                                idx,
                                'quantityUsed',
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                          <span className="text-xs text-bakery-muted font-medium w-10">
                            {selectedMat?.purchaseUnit || ''}
                          </span>
                        </div>
                        <div className="w-full sm:w-28 text-right font-mono text-xs font-bold text-bakery-espresso px-2">
                          ${rowCost}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeIngredientRow(idx)}
                          disabled={builderIngredients.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIVE VISUAL BREAKDOWN CARD */}
              <div className="rounded-xl border border-bakery-border bg-amber-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-bakery-darkMuted flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-bakery-gold" />
                    Live Batch Breakdown (Real-time Keystroke Math)
                  </span>
                  <span className="text-xs font-mono text-bakery-muted">
                    Yield: {yieldSlices} slices
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-bakery-border">
                    <div className="text-[11px] text-bakery-muted">Raw Ingredients</div>
                    <div className="font-mono text-sm font-extrabold text-bakery-espresso mt-0.5">
                      {formatCurrency(liveCostBreakdown.rawIngredientsCost)}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-bakery-border">
                    <div className="text-[11px] text-bakery-muted">
                      Overhead ({(overheadPercent * 100).toFixed(0)}%)
                    </div>
                    <div className="font-mono text-sm font-extrabold text-bakery-espresso mt-0.5">
                      {formatCurrency(liveCostBreakdown.overheadBufferCost)}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-bakery-border">
                    <div className="text-[11px] text-bakery-muted">Slice Packaging</div>
                    <div className="font-mono text-sm font-extrabold text-bakery-espresso mt-0.5">
                      {formatCurrency(liveCostBreakdown.slicePackagingTotal)}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-bakery-border">
                    <div className="text-[11px] text-bakery-muted">Outer Box</div>
                    <div className="font-mono text-sm font-extrabold text-bakery-espresso mt-0.5">
                      {formatCurrency(liveCostBreakdown.outerBoxCost)}
                    </div>
                  </div>
                  <div className="bg-bakery-espresso text-white p-2.5 rounded-lg col-span-2 sm:col-span-1 shadow-sm">
                    <div className="text-[11px] text-[#f7e8d0]">Total Batch Cost</div>
                    <div className="font-mono text-base font-extrabold text-white mt-0.5">
                      {formatCurrency(liveCostBreakdown.totalBatchCost)}
                    </div>
                  </div>
                </div>

                {/* Target Margin Slider */}
                <div className="bg-white p-4 rounded-xl border border-bakery-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-bakery-espresso flex items-center gap-1">
                        <Percent className="h-3.5 w-3.5 text-bakery-gold" /> Target Wholesale Margin
                      </span>
                      <span className="text-[11px] text-bakery-muted block">
                        Adjust slider (30% - 70%) to compute recommended cafe wholesale price per slice
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-bakery-espresso px-3 py-0.5 rounded bg-bakery-goldLight">
                      {targetMargin}%
                    </span>
                  </div>

                  <Slider
                    value={[targetMargin]}
                    min={30}
                    max={70}
                    step={1}
                    onValueChange={(val) => setTargetMargin(val[0])}
                    className="py-2"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-bakery-border/50 text-center">
                    <div>
                      <span className="text-[11px] text-bakery-muted">Cost Per Slice:</span>
                      <div className="font-mono text-sm font-bold text-bakery-espresso">
                        ${liveCostBreakdown.costPerSlice.toFixed(3)}
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-1.5 border border-emerald-200">
                      <span className="text-[11px] text-emerald-800 font-semibold">
                        Recommended Wholesale Price:
                      </span>
                      <div className="font-mono text-base font-extrabold text-emerald-700">
                        ${suggestedPricePerSlice.toFixed(2)} / slice
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-bakery-muted">Wholesale Revenue / Loaf:</span>
                      <div className="font-mono text-sm font-bold text-bakery-espresso">
                        ${(suggestedPricePerSlice * yieldSlices).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBuilderOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Recipe...' : 'Save & Publish Recipe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recipes List Table */}
      <Card className="border-bakery-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-bakery-border/60 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-bakery-espresso">
                Active Sweets & Loaves Catalog
              </CardTitle>
              <CardDescription className="text-xs text-bakery-muted">
                Pre-sliced portions, landed costs, and suggested wholesale pricing at 50% target margin.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-bakery-muted">
              {recipes.length} Active {recipes.length === 1 ? 'Recipe' : 'Recipes'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-bakery-muted text-sm">
              Loading recipe master list...
            </div>
          ) : recipes.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-bakery-muted/40 mb-2" />
              <p className="text-sm font-medium text-bakery-espresso">No recipes created yet</p>
              <p className="text-xs text-bakery-muted mt-1">
                Click &quot;New Recipe Builder&quot; above to create your first wholesale sweet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-bakery-cream/60">
                  <TableHead>Recipe Name & Specs</TableHead>
                  <TableHead className="text-center">Batch Yield</TableHead>
                  <TableHead className="text-right">Raw Batch Cost</TableHead>
                  <TableHead className="text-right">Total Loaf Cost</TableHead>
                  <TableHead className="text-right">Landed Cost / Slice</TableHead>
                  <TableHead className="text-right">Suggested Wholesale (50% Margin)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((recipe) => {
                  const breakdown = recipe.costBreakdown;
                  // Suggested wholesale at 50% margin
                  const suggested50 = breakdown.costPerSlice / 0.5;

                  return (
                    <TableRow key={recipe.id} className="hover:bg-bakery-cream/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="font-mono text-xs">
                            {recipe.skuPrefix}
                          </Badge>
                          <Link
                            href={`/recipes/${recipe.id}`}
                            className="font-bold text-bakery-espresso hover:text-bakery-gold hover:underline"
                          >
                            {recipe.name}
                          </Link>
                        </div>
                        <div className="text-xs text-bakery-muted mt-0.5">
                          {recipe.ovenMinutes} min bake • {recipe.shelfLifeDays} days shelf-life •{' '}
                          {recipe.ingredients.length} ingredients
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-sm text-bakery-espresso">
                          {recipe.yieldSlices} slices
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm text-bakery-espresso">
                        {formatCurrency(breakdown.rawIngredientsCost)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm text-bakery-espresso">
                        {formatCurrency(breakdown.totalBatchCost)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm text-bakery-espresso">
                        ${breakdown.costPerSlice.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-sm font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                          ${suggested50.toFixed(2)} / slice
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/recipes/${recipe.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs border-bakery-border hover:bg-bakery-cream gap-1"
                            >
                              Details <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
