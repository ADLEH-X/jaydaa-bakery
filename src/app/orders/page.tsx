import Link from 'next/link';
import {
  Receipt,
  Plus,
  Download,
  Search,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { getOrders } from '../actions';
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
import { DeleteOrderButton } from '@/components/orders/DeleteOrderButton';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string) {
  switch (status) {
    case OrderStatus.CONFIRMED:
      return <Badge variant="info">CONFIRMED</Badge>;
    case OrderStatus.BAKED:
      return <Badge variant="warning">BAKED</Badge>;
    case OrderStatus.DELIVERED:
      return <Badge variant="secondary">DELIVERED</Badge>;
    case OrderStatus.PAID:
      return <Badge variant="success">PAID</Badge>;
    case OrderStatus.CANCELLED:
      return <Badge variant="destructive">CANCELLED</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function OrdersListPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-bakery-espresso sm:text-3xl">
            Wholesale Orders & Invoices
          </h1>
          <p className="text-sm text-bakery-muted mt-1">
            Browse active dispatches, payment settlements, and stream official PDF billing documents.
          </p>
        </div>
        <Link href="/orders/new">
          <Button variant="gold" className="gap-2 font-semibold shadow">
            <Plus className="h-4 w-4" />
            Create New Order
          </Button>
        </Link>
      </div>

      {/* Orders Table */}
      <Card className="border-bakery-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-bakery-border/60 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-bakery-espresso">
              All Wholesale Invoices
            </CardTitle>
            <span className="text-xs font-semibold text-bakery-muted">
              {orders.length} Total Orders
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="mx-auto h-8 w-8 text-bakery-muted/40 mb-2" />
              <p className="text-sm font-medium text-bakery-espresso">No orders recorded yet</p>
              <p className="text-xs text-bakery-muted mt-1">
                Click &quot;Create New Order&quot; to initiate your first wholesale dispatch.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-bakery-cream/60">
                  <TableHead className="w-[140px]">Invoice Ref</TableHead>
                  <TableHead>Coffee Shop & Branch</TableHead>
                  <TableHead>Delivery Schedule</TableHead>
                  <TableHead className="text-center">Total Loaves</TableHead>
                  <TableHead className="text-center">Wrapped Slices</TableHead>
                  <TableHead className="text-right">Billed Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-bakery-cream/30">
                    <TableCell className="font-mono text-xs font-bold text-bakery-espresso">
                      <Link
                        href={`/orders/${order.id}`}
                        className="hover:text-bakery-gold underline-offset-2 hover:underline"
                      >
                        #{order.invoiceRef}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-bakery-espresso text-sm">
                        {order.cafe.name}
                      </div>
                      <div className="text-xs text-bakery-muted">
                        {order.cafe.branch} • {order.cafe.clientCode}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-bakery-espresso">
                        {formatDate(order.deliveryDate)}
                      </div>
                      <div className="text-[11px] text-bakery-muted">
                        {order.dispatchTime}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-sm text-bakery-espresso">
                      {order.totalLoaves}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-xs text-bakery-muted">
                      {order.totalSlices} pcs
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-sm text-bakery-espresso">
                      {formatCurrency(order.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/api/orders/${order.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs border-bakery-border hover:bg-bakery-cream"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5 text-bakery-gold" />
                          </Button>
                        </a>
                        <Link href={`/orders/${order.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 text-xs text-bakery-espresso hover:bg-bakery-cream gap-1"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                        <DeleteOrderButton
                          orderId={order.id}
                          invoiceRef={order.invoiceRef}
                          clientName={order.cafe.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
