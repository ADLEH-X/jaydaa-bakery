import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  MessageCircle,
  Clock,
  Calendar,
  Building,
  CheckCircle,
  Truck,
  DollarSign,
  ShieldCheck,
  FileText,
  CreditCard,
  QrCode,
  Tag,
} from 'lucide-react';
import { getOrder, updateOrderStatus } from '../../actions';
import { DeleteOrderButton } from '@/components/orders/DeleteOrderButton';
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
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/types';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  // Generate WhatsApp message according to exact spec:
  // *Jaydaa Bakery - Order Confirmation & Dispatch*
  // Ref: #{invoiceRef}
  // Client: {cafeName} ({branch})
  // Delivery: {deliveryDate} @ {dispatchTime}
  //
  // *Summary:*
  // • {loaves} Loaf ({slices} slices) - {recipeName} (Batch #{batchCode})
  //
  // *Total Due:* ${totalRevenue} ({paymentTerms})
  // *Status:* Freshly scheduled for direct drop-off.

  const formattedDeliveryDate = new Date(order.deliveryDate).toLocaleDateString('en-GB');
  const summaryLines = order.items
    .map(
      (item) =>
        `• ${item.loavesOrdered} Loaf (${item.totalSlices} slices) - ${item.recipe.name} (Batch #${item.batchCode})`
    )
    .join('\n');

  const whatsappMessage = `*Jaydaa Bakery - Order Confirmation & Dispatch*
Ref: #${order.invoiceRef}
Client: ${order.cafe.name} (${order.cafe.branch})
Delivery: ${formattedDeliveryDate} @ ${order.dispatchTime}

*Summary:*
${summaryLines}

*Total Due:* ${formatCurrency(order.totalRevenue)} (${order.paymentTerms})
*Status:* Freshly scheduled for direct drop-off.`;

  const cleanPhone = order.cafe.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-bakery-border">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-bakery-espresso">
                Invoice #{order.invoiceRef}
              </h1>
              <Badge
                variant={
                  order.status === OrderStatus.PAID
                    ? 'success'
                    : order.status === OrderStatus.DELIVERED
                    ? 'secondary'
                    : order.status === OrderStatus.BAKED
                    ? 'warning'
                    : 'info'
                }
              >
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-bakery-muted mt-0.5">
              Issued: {formatDate(order.orderDate)} • Client: {order.cafe.name} ({order.cafe.clientCode})
            </p>
          </div>
        </div>

        {/* Action Buttons: PDF & WhatsApp */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`/api/orders/${order.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="default" className="gap-2 font-semibold shadow">
              <Download className="h-4 w-4 text-bakery-gold" />
              Download Official PDF Bill
            </Button>
          </a>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="gap-2 font-semibold border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 shadow-xs"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              Send WhatsApp Dispatch
            </Button>
          </a>

          <DeleteOrderButton
            orderId={order.id}
            invoiceRef={order.invoiceRef}
            clientName={order.cafe.name}
            variant="outline"
            redirectUrl="/orders"
          />
        </div>
      </div>

      {/* Two-Column Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Details */}
        <Card className="border-bakery-border shadow-xs">
          <CardHeader className="bg-bakery-cream/40 border-b border-bakery-border/60 py-3 px-5">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-bakery-gold flex items-center gap-1.5">
              <Building className="h-4 w-4" /> Bill & Deliver To (Client)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-1.5 text-sm">
            <div className="text-base font-bold text-bakery-espresso">
              {order.cafe.name}
            </div>
            <div className="text-xs text-bakery-muted space-y-1">
              <div>
                <strong>Branch:</strong> {order.cafe.branch}
              </div>
              <div>
                <strong>Contact Person:</strong> {order.cafe.contactPerson}
              </div>
              <div>
                <strong>Phone:</strong> {order.cafe.phone}
              </div>
              <div>
                <strong>Client Code:</strong>{' '}
                <span className="font-mono font-bold text-bakery-espresso">
                  {order.cafe.clientCode}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fulfillment Protocol */}
        <Card className="border-bakery-border shadow-xs">
          <CardHeader className="bg-bakery-cream/40 border-b border-bakery-border/60 py-3 px-5">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-bakery-gold flex items-center gap-1.5">
              <Truck className="h-4 w-4" /> Batch & Fulfillment Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-1.5 text-sm">
            <div className="text-base font-bold text-bakery-espresso">
              Fresh Daily Morning Dispatch
            </div>
            <div className="text-xs text-bakery-muted space-y-1">
              <div>
                <strong>Delivery Date:</strong> {formatDate(order.deliveryDate)}
              </div>
              <div>
                <strong>Dispatch Window:</strong> {order.dispatchTime}
              </div>
              <div>
                <strong>Payment Terms:</strong>{' '}
                <span className="font-semibold text-bakery-espresso bg-bakery-goldLight px-1.5 py-0.5 rounded">
                  {order.paymentTerms}
                </span>
              </div>
              <div>
                <strong>Packaging Standard:</strong> Pre-sliced (8 pcs/loaf), Food-grade sealed sleeve
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card className="border-bakery-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-bakery-border/60 bg-white px-6 py-4">
          <CardTitle className="text-base font-bold text-bakery-espresso">
            Line Items & Traceability
          </CardTitle>
          <CardDescription className="text-xs text-bakery-muted">
            Portions, unit economics snapshots, and batch tracking codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-bakery-cream/60">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Description & Specs</TableHead>
                <TableHead className="text-center">Loaves</TableHead>
                <TableHead className="text-center">Yield / Loaf</TableHead>
                <TableHead className="text-center">Total Slices</TableHead>
                <TableHead className="text-right">Price / Slice</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, idx) => (
                <TableRow key={item.id} className="hover:bg-bakery-cream/30">
                  <TableCell className="text-center font-medium text-xs text-bakery-muted">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-bakery-espresso text-sm">
                      {item.recipe.name}
                    </div>
                    <div className="text-xs text-bakery-muted">
                      Pre-sliced & individually sealed in crystal pouches with allergen labels
                    </div>
                    <div className="inline-flex items-center gap-1 bg-[#f5ebe1] text-[#5e4533] px-2 py-0.5 rounded text-[11px] font-semibold mt-1">
                      <Tag className="h-3 w-3" /> Batch #{item.batchCode} • Prod:{' '}
                      {new Date(item.productionDate).toLocaleDateString('en-GB')} • Expiry:{' '}
                      {new Date(item.bestBeforeDate).toLocaleDateString('en-GB')}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-sm text-bakery-espresso">
                    {item.loavesOrdered}
                  </TableCell>
                  <TableCell className="text-center text-xs text-bakery-muted">
                    {item.yieldPerLoaf} slices
                  </TableCell>
                  <TableCell className="text-center font-extrabold text-sm text-bakery-espresso">
                    {item.totalSlices} pcs
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(item.pricePerSlice)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-extrabold text-sm text-bakery-espresso">
                    {formatCurrency(item.lineRevenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Financial & Status Controls Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Transition Control */}
        <Card className="border-bakery-border shadow-xs p-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-bakery-espresso block">
            Update Delivery / Payment Status
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              OrderStatus.CONFIRMED,
              OrderStatus.BAKED,
              OrderStatus.DELIVERED,
              OrderStatus.PAID,
              OrderStatus.CANCELLED,
            ].map((st) => (
              <form
                key={st}
                action={async () => {
                  'use server';
                  await updateOrderStatus(order.id, st);
                }}
              >
                <Button
                  type="submit"
                  size="sm"
                  variant={order.status === st ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {st}
                </Button>
              </form>
            ))}
          </div>

          <div className="text-xs text-bakery-muted pt-2 border-t border-bakery-border/50">
            <strong>Internal Economics:</strong> Total Landed Cost:{' '}
            <span className="font-mono font-semibold">{formatCurrency(order.totalCost)}</span> • Net
            Profit:{' '}
            <span className="font-mono font-bold text-emerald-700">
              +{formatCurrency(order.netProfit)} ({order.profitMargin}%)
            </span>
          </div>
        </Card>

        {/* Invoice Total Banner */}
        <div className="rounded-xl border border-bakery-border bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-bakery-muted">
              <span>Total Loaves Delivered:</span>
              <strong className="text-bakery-espresso">{order.totalLoaves} Loaves</strong>
            </div>
            <div className="flex justify-between text-bakery-muted">
              <span>Total Wrapped Slices:</span>
              <strong className="text-bakery-espresso">{order.totalSlices} Slices</strong>
            </div>
            <div className="flex justify-between text-bakery-muted">
              <span>B2B Scheduled Delivery:</span>
              <strong className="text-emerald-600 font-bold">FREE</strong>
            </div>
          </div>

          <div className="mt-4 p-3 bg-bakery-espresso text-white rounded-lg flex items-center justify-between">
            <span className="font-bold text-sm">TOTAL DUE:</span>
            <span className="font-mono text-2xl font-extrabold text-[#f7e8d0]">
              {formatCurrency(order.totalRevenue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
