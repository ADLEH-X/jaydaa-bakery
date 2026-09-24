import Link from 'next/link';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowUpRight,
  Truck,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { getDashboardData, updateOrderStatus } from './actions';
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

export default async function DashboardPage() {
  const { kpis, scheduleOrders } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-bakery-espresso sm:text-3xl">
            Bakery Operations Dashboard
          </h1>
          <p className="text-sm text-bakery-muted mt-1">
            Real-time batch economics, dispatch schedules, and B2B receivables.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/orders/new">
            <Button variant="gold" className="gap-2 font-semibold shadow-sm">
              <Plus className="h-4 w-4" />
              Create New Order
            </Button>
          </Link>
          <Link href="/cost-library">
            <Button variant="outline" className="gap-2 font-medium">
              <Package className="h-4 w-4 text-bakery-gold" />
              Add Raw Material
            </Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline" className="gap-2 font-medium">
              <Sparkles className="h-4 w-4 text-bakery-gold" />
              View Recipe Margins
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Today's Deliveries */}
        <Card className="border-bakery-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bakery-muted">
              Today&apos;s Deliveries
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-bakery-espresso">
              {kpis.todayLoaves} Loaves
            </div>
            <p className="text-xs text-bakery-muted mt-1">
              <span className="font-semibold text-bakery-darkMuted">
                {kpis.todaySlices} slices
              </span>{' '}
              across {kpis.todayOrdersCount} scheduled drop-offs
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Gross Revenue (Month) */}
        <Card className="border-bakery-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bakery-muted">
              Gross Revenue (Month)
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-bakery-espresso">
              {formatCurrency(kpis.grossRevenue)}
            </div>
            <p className="text-xs text-bakery-muted mt-1">
              Confirmed wholesale billings this calendar month
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Net Profit & Realized Margin */}
        <Card className="border-bakery-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bakery-muted">
              Net Profit & Margin
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-700">
              {formatCurrency(kpis.netProfit)}
            </div>
            <p className="text-xs text-bakery-muted mt-1">
              Realized margin:{' '}
              <span className="font-bold text-bakery-espresso">
                {kpis.realizedMargin}%
              </span>{' '}
              after packaging & overheads
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Unpaid Receivables */}
        <Card className="border-bakery-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-bakery-muted">
              Unpaid Receivables
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-rose-600">
              {formatCurrency(kpis.unpaidReceivables)}
            </div>
            <p className="text-xs text-bakery-muted mt-1">
              Active orders awaiting payment settlement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Schedule Table */}
      <Card className="border-bakery-border shadow-sm">
        <CardHeader className="border-b border-bakery-border/60 bg-[#ffffff] px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-bakery-espresso flex items-center gap-2">
                <Calendar className="h-5 w-5 text-bakery-gold" />
                Dispatch & Delivery Schedule (Today & Tomorrow)
              </CardTitle>
              <CardDescription className="text-xs text-bakery-muted mt-0.5">
                Manage live status progression from baking to delivery and invoice collection.
              </CardDescription>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-bakery-gold hover:text-[#9e6730] flex items-center gap-1"
            >
              View All Orders <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {scheduleOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="mx-auto h-8 w-8 text-bakery-muted/40 mb-2" />
              <p className="text-sm font-medium text-bakery-espresso">
                No deliveries scheduled for today or tomorrow.
              </p>
              <p className="text-xs text-bakery-muted mt-1">
                Click &quot;Create New Order&quot; above to schedule a fresh wholesale dispatch.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-bakery-cream/60">
                  <TableHead className="w-[120px]">Invoice Ref</TableHead>
                  <TableHead>Client & Branch</TableHead>
                  <TableHead>Drop-Off Schedule</TableHead>
                  <TableHead className="text-center">Units</TableHead>
                  <TableHead className="text-right">Total Due</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Quick Status Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleOrders.map((order) => {
                  const nextStatus =
                    order.status === OrderStatus.CONFIRMED
                      ? OrderStatus.BAKED
                      : order.status === OrderStatus.BAKED
                      ? OrderStatus.DELIVERED
                      : order.status === OrderStatus.DELIVERED
                      ? OrderStatus.PAID
                      : null;

                  return (
                    <TableRow key={order.id} className="hover:bg-bakery-cream/40">
                      <TableCell className="font-mono text-xs font-bold text-bakery-espresso">
                        <Link
                          href={`/orders/${order.id}`}
                          className="hover:text-bakery-gold underline-offset-2 hover:underline"
                        >
                          #{order.invoiceRef}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-bakery-espresso text-sm">
                          {order.cafe.name}
                        </div>
                        <div className="text-xs text-bakery-muted">
                          {order.cafe.branch} • {order.cafe.contactPerson}
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
                      <TableCell className="text-center">
                        <span className="font-bold text-bakery-espresso text-sm">
                          {order.totalLoaves} L
                        </span>
                        <span className="text-xs text-bakery-muted">
                          {' '}
                          ({order.totalSlices} pcs)
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-bakery-espresso text-sm">
                        {formatCurrency(order.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {nextStatus ? (
                            <form
                              action={async () => {
                                'use server';
                                await updateOrderStatus(order.id, nextStatus);
                              }}
                            >
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-bakery-border hover:bg-bakery-gold hover:text-white"
                              >
                                Mark {nextStatus} &rarr;
                              </Button>
                            </form>
                          ) : (
                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                            </span>
                          )}
                          <Link href={`/orders/${order.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                              Details
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
