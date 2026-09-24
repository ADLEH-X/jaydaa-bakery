'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Coffee,
  Plus,
  Edit2,
  Trash2,
  Phone,
  DollarSign,
  Receipt,
  AlertCircle,
  ExternalLink,
  Search,
  MessageCircle,
} from 'lucide-react';
import { getCafes, createCafe, updateCafe, deleteCafe } from '../actions';
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
import { PaymentMethod } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CafesPage() {
  const [cafes, setCafes] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCafe, setEditingCafe] = React.useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [formName, setFormName] = React.useState('');
  const [formBranch, setFormBranch] = React.useState('');
  const [formContactPerson, setFormContactPerson] = React.useState('');
  const [formPhone, setFormPhone] = React.useState('');
  const [formClientCode, setFormClientCode] = React.useState('');
  const [formDefaultPrice, setFormDefaultPrice] = React.useState<number>(1.4);
  const [formPaymentMethod, setFormPaymentMethod] = React.useState<string>(PaymentMethod.COD);

  const loadCafes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCafes();
      setCafes(data);
    } catch (err) {
      console.error('Failed to load cafes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCafes();
  }, [loadCafes]);

  const openCreateModal = () => {
    setEditingCafe(null);
    setFormName('');
    setFormBranch('');
    setFormContactPerson('');
    setFormPhone('+9665');
    setFormClientCode('');
    setFormDefaultPrice(1.4);
    setFormPaymentMethod(PaymentMethod.COD);
    setIsModalOpen(true);
  };

  const openEditModal = (cafe: any) => {
    setEditingCafe(cafe);
    setFormName(cafe.name);
    setFormBranch(cafe.branch);
    setFormContactPerson(cafe.contactPerson);
    setFormPhone(cafe.phone);
    setFormClientCode(cafe.clientCode);
    setFormDefaultPrice(cafe.defaultPricePerSlice);
    setFormPaymentMethod(cafe.defaultPaymentMethod);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formClientCode.trim() || formDefaultPrice <= 0) return;

    setIsSubmitting(true);
    try {
      if (editingCafe) {
        await updateCafe(editingCafe.id, {
          name: formName,
          branch: formBranch,
          contactPerson: formContactPerson,
          phone: formPhone,
          clientCode: formClientCode,
          defaultPricePerSlice: Number(formDefaultPrice),
          defaultPaymentMethod: formPaymentMethod,
        });
      } else {
        await createCafe({
          name: formName,
          branch: formBranch,
          contactPerson: formContactPerson,
          phone: formPhone,
          clientCode: formClientCode,
          defaultPricePerSlice: Number(formDefaultPrice),
          defaultPaymentMethod: formPaymentMethod,
        });
      }
      setIsModalOpen(false);
      await loadCafes();
    } catch (err) {
      console.error('Failed to save cafe:', err);
      alert('Error saving cafe profile. Ensure client code is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Existing order records may block deletion.`)) {
      return;
    }
    try {
      await deleteCafe(id);
      await loadCafes();
    } catch (err) {
      console.error('Failed to delete cafe:', err);
      alert('Cannot delete cafe with active historical orders.');
    }
  };

  const filteredCafes = cafes.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.branch.toLowerCase().includes(q) ||
      c.clientCode.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-bakery-espresso sm:text-3xl">
            Cafe CRM & Client Ledger
          </h1>
          <p className="text-sm text-bakery-muted mt-1">
            Manage specialty coffee shop accounts, wholesale pricing agreements, and outstanding receivables.
          </p>
        </div>
        <Button onClick={openCreateModal} variant="gold" className="gap-2 font-semibold shadow">
          <Plus className="h-4 w-4" />
          Add Coffee Shop
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-bakery-border shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-bakery-muted" />
          <Input
            placeholder="Search coffee shops by name, branch, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Cafes Table */}
      <Card className="border-bakery-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-bakery-muted text-sm">
              Loading coffee shop registry...
            </div>
          ) : filteredCafes.length === 0 ? (
            <div className="p-12 text-center">
              <Coffee className="mx-auto h-8 w-8 text-bakery-muted/40 mb-2" />
              <p className="text-sm font-medium text-bakery-espresso">No coffee shops found</p>
              <p className="text-xs text-bakery-muted mt-1">
                Click &quot;Add Coffee Shop&quot; to register your first partner cafe.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-bakery-cream/60">
                  <TableHead>Client & Code</TableHead>
                  <TableHead>Contact & Phone</TableHead>
                  <TableHead className="text-right">Agreed Price / Slice</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead className="text-center">Lifetime Orders</TableHead>
                  <TableHead className="text-right">Lifetime Billed</TableHead>
                  <TableHead className="text-right">Outstanding Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCafes.map((cafe) => {
                  const hasOutstanding = cafe.outstandingBalance > 0;
                  const cleanPhone = cafe.phone.replace(/[^0-9]/g, '');

                  return (
                    <TableRow key={cafe.id} className="hover:bg-bakery-cream/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="font-mono text-xs">
                            {cafe.clientCode}
                          </Badge>
                          <div className="font-bold text-bakery-espresso text-sm">
                            {cafe.name}
                          </div>
                        </div>
                        <div className="text-xs text-bakery-muted mt-0.5">
                          {cafe.branch}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold text-bakery-espresso">
                          {cafe.contactPerson}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-bakery-muted mt-0.5">
                          <Phone className="h-3 w-3 text-bakery-gold" />
                          <span>{cafe.phone}</span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 ml-1"
                              title="Open WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5 inline" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-sm text-bakery-espresso">
                        ${cafe.defaultPricePerSlice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[11px]">
                          {cafe.defaultPaymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-xs text-bakery-espresso">
                        {cafe.totalOrdersCount}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm text-bakery-espresso">
                        {formatCurrency(cafe.lifetimeRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {hasOutstanding ? (
                          <span className="font-mono text-xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            {formatCurrency(cafe.outstandingBalance)}
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            $0.00 (Settled)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/orders/new?cafeId=${cafe.id}`}>
                            <Button
                              size="sm"
                              variant="gold"
                              className="h-8 px-2.5 text-xs font-semibold shadow-xs"
                            >
                              Order
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-bakery-border"
                            onClick={() => openEditModal(cafe)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-bakery-gold" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(cafe.id, cafe.name)}
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

      {/* Add / Edit Cafe Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingCafe ? 'Edit Cafe Profile' : 'Register New Coffee Shop Partner'}
              </DialogTitle>
              <DialogDescription>
                Configure agreed wholesale pricing per slice and standard delivery terms.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Coffee Shop Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Roast & Bloom Specialty Coffee"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Client Code
                  </label>
                  <Input
                    required
                    maxLength={10}
                    placeholder="e.g. RB-014"
                    value={formClientCode}
                    onChange={(e) => setFormClientCode(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Branch / Location
                  </label>
                  <Input
                    required
                    placeholder="e.g. Al Malqa Hub"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Contact Person & Role
                  </label>
                  <Input
                    required
                    placeholder="e.g. Faisal / Store Manager"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    WhatsApp Phone Number
                  </label>
                  <Input
                    required
                    placeholder="e.g. +966551234567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-bakery-espresso">
                    Agreed Price/Slice ($)
                  </label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder="1.40"
                    value={formDefaultPrice}
                    onChange={(e) => setFormDefaultPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-bakery-espresso">
                  Default Payment Method
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-bakery-border bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bakery-espresso"
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value)}
                >
                  <option value={PaymentMethod.COD}>COD (Cash On Delivery)</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                  <option value={PaymentMethod.STC_PAY}>STC Pay</option>
                  <option value={PaymentMethod.NET_7_DAYS}>Net 7 Days Credit</option>
                </select>
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
                {isSubmitting ? 'Saving...' : editingCafe ? 'Update Profile' : 'Register Cafe'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
