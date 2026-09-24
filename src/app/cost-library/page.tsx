'use client';

import * as React from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Layers,
  ArrowUpDown,
  Search,
} from 'lucide-react';
import {
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from '../actions';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MaterialCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function CostLibraryPage() {
  const [materials, setMaterials] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [formName, setFormName] = React.useState('');
  const [formCategory, setFormCategory] = React.useState<string>(MaterialCategory.INGREDIENT);
  const [formPurchaseQuantity, setFormPurchaseQuantity] = React.useState<number>(1000);
  const [formPurchaseUnit, setFormPurchaseUnit] = React.useState('g');
  const [formPurchaseCost, setFormPurchaseCost] = React.useState<number>(1.0);

  const loadMaterials = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRawMaterials();
      setMaterials(data);
    } catch (err) {
      console.error('Failed to load raw materials:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormName('');
    setFormCategory(MaterialCategory.INGREDIENT);
    setFormPurchaseQuantity(1000);
    setFormPurchaseUnit('g');
    setFormPurchaseCost(1.0);
    setIsModalOpen(true);
  };

  const openEditModal = (material: any) => {
    setEditingMaterial(material);
    setFormName(material.name);
    setFormCategory(material.category);
    setFormPurchaseQuantity(material.purchaseQuantity);
    setFormPurchaseUnit(material.purchaseUnit);
    setFormPurchaseCost(material.purchaseCost);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPurchaseQuantity <= 0 || formPurchaseCost < 0) return;

    setIsSubmitting(true);
    try {
      if (editingMaterial) {
        await updateRawMaterial(editingMaterial.id, {
          name: formName,
          category: formCategory,
          purchaseQuantity: Number(formPurchaseQuantity),
          purchaseUnit: formPurchaseUnit,
          purchaseCost: Number(formPurchaseCost),
        });
      } else {
        await createRawMaterial({
          name: formName,
          category: formCategory,
          purchaseQuantity: Number(formPurchaseQuantity),
          purchaseUnit: formPurchaseUnit,
          purchaseCost: Number(formPurchaseCost),
        });
      }
      setIsModalOpen(false);
      await loadMaterials();
    } catch (err) {
      console.error('Failed to save material:', err);
      alert('Error saving material. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? Recipes using this material may be affected.`)) {
      return;
    }
    try {
      await deleteRawMaterial(id);
      await loadMaterials();
    } catch (err) {
      console.error('Failed to delete material:', err);
      alert('Cannot delete material if it is currently linked to existing recipes.');
    }
  };

  // Preview unit cost in modal
  const previewUnitCost =
    formPurchaseQuantity > 0 ? (formPurchaseCost / formPurchaseQuantity).toFixed(5) : '0.00000';

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.purchaseUnit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-bakery-espresso sm:text-3xl">
            Cost Master Library
          </h1>
          <p className="text-sm text-bakery-muted mt-1">
            Maintain wholesale purchase prices for all raw ingredients, packaging sleeves, and outer boxes.
          </p>
        </div>
        <Button onClick={openCreateModal} variant="gold" className="gap-2 font-semibold">
          <Plus className="h-4 w-4" />
          Add Raw Material
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-bakery-border shadow-sm p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-bakery-muted" />
            <Input
              placeholder="Search materials (e.g. Flour, Sugar, Sleeves)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['ALL', MaterialCategory.INGREDIENT, MaterialCategory.PACKAGING, MaterialCategory.OVERHEAD].map(
              (cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className="text-xs h-8"
                >
                  {cat === 'ALL' ? 'All Materials' : cat}
                </Button>
              )
            )}
          </div>
        </div>
      </Card>

      {/* Materials Table */}
      <Card className="border-bakery-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-bakery-muted text-sm">
              Loading cost master library...
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto h-8 w-8 text-bakery-muted/40 mb-2" />
              <p className="text-sm font-medium text-bakery-espresso">No materials found</p>
              <p className="text-xs text-bakery-muted mt-1">
                Try adjusting your search filter or click &quot;Add Raw Material&quot;.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-bakery-cream/60">
                  <TableHead>Material Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Market Purchase Batch</TableHead>
                  <TableHead className="text-right">Purchase Cost</TableHead>
                  <TableHead className="text-right">Computed Unit Cost</TableHead>
                  <TableHead className="text-center">Dependent Recipes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => {
                  const dependentRecipesCount = material.recipeIngredients?.length || 0;
                  return (
                    <TableRow key={material.id} className="hover:bg-bakery-cream/30">
                      <TableCell className="font-semibold text-bakery-espresso">
                        {material.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            material.category === MaterialCategory.INGREDIENT
                              ? 'secondary'
                              : material.category === MaterialCategory.PACKAGING
                              ? 'gold'
                              : 'outline'
                          }
                          className="text-[11px]"
                        >
                          {material.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm text-bakery-espresso">
                        {material.purchaseQuantity.toLocaleString()} {material.purchaseUnit}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm text-bakery-espresso">
                        {formatCurrency(material.purchaseCost)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-xs font-bold text-bakery-espresso bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          ${material.unitCost.toFixed(5)} / {material.purchaseUnit}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {dependentRecipesCount > 0 ? (
                          <span className="text-xs font-semibold text-bakery-darkMuted bg-bakery-cream px-2 py-0.5 rounded border border-bakery-border">
                            {dependentRecipesCount} recipe{dependentRecipesCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-bakery-muted/60">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs border-bakery-border hover:bg-bakery-cream"
                            onClick={() => openEditModal(material)}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-1 text-bakery-gold" />
                            Update Price
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(material.id, material.name)}
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

      {/* Add / Edit Material Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Update Market Purchase Price' : 'Add New Raw Material'}
              </DialogTitle>
              <DialogDescription>
                Updating purchase cost automatically recalculates unit costs across all dependent recipes in real time.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-bakery-espresso">
                  Material Name
                </label>
                <Input
                  required
                  placeholder="e.g. Granulated Sugar (1kg)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Category
                  </label>
                  <select
                    className="flex h-9 w-full rounded-md border border-bakery-border bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bakery-espresso"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value={MaterialCategory.INGREDIENT}>INGREDIENT</option>
                    <option value={MaterialCategory.PACKAGING}>PACKAGING</option>
                    <option value={MaterialCategory.OVERHEAD}>OVERHEAD</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Purchase Unit
                  </label>
                  <Input
                    required
                    placeholder="e.g. g, ml, pcs, pack"
                    value={formPurchaseUnit}
                    onChange={(e) => setFormPurchaseUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Purchase Quantity
                  </label>
                  <Input
                    required
                    type="number"
                    step="any"
                    min="0.001"
                    placeholder="e.g. 1000"
                    value={formPurchaseQuantity}
                    onChange={(e) => setFormPurchaseQuantity(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Market Purchase Cost ($)
                  </label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1.10"
                    value={formPurchaseCost}
                    onChange={(e) => setFormPurchaseCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-lg border border-bakery-border bg-bakery-cream/70 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-bakery-muted">
                    Auto-Calculated Unit Cost:
                  </span>
                  <span className="font-mono text-sm font-extrabold text-bakery-espresso">
                    ${previewUnitCost} / {formPurchaseUnit || 'unit'}
                  </span>
                </div>
                <p className="text-[11px] text-bakery-muted mt-1">
                  Formula: Purchase Cost (${formPurchaseCost}) &divide; Quantity ({formPurchaseQuantity} {formPurchaseUnit})
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingMaterial ? 'Update & Recalculate' : 'Create Material'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
