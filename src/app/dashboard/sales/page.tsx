import Link from 'next/link';
import {
  isSalesOrderEditable,
  listCustomers,
  listSalesOrders,
  listWarehouses,
} from '@/db';
import PageShell from '@/components/PageShell';
import SalesOrderModal from '@/components/SalesOrderModal';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const [orders, customers, warehouses] = await Promise.all([
    listSalesOrders(),
    listCustomers(),
    listWarehouses(),
  ]);

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name as string,
  }));
  const warehouseOptions = warehouses.map((w) => ({
    value: w.id,
    label: w.name as string,
  }));

  const blocker =
    customers.length === 0
      ? 'Add a customer first.'
      : warehouses.length === 0
        ? 'Add a warehouse first.'
        : null;

  return (
    <PageShell
      crumb="Sales"
      title="Sales Orders"
      description="What you sold, to whom, and whether it has shipped."
      action={
        <SalesOrderModal
          customers={customerOptions}
          warehouses={warehouseOptions}
        />
      }
    >
      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {blocker
            ? `No sales orders yet. ${blocker}`
            : 'No sales orders yet. Create one, add line items, then ship it.'}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Ship From</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/sales/${order.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  {order.expand?.customer?.name ?? 'Unknown'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {order.expand?.warehouse?.name ?? '--'}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap md:table-cell">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : '--'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status as string} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {Number(order.total ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline" className="h-8">
                    <Link href={`/dashboard/sales/${order.id}`}>
                      {isSalesOrderEditable(order.status as string)
                        ? 'Add items'
                        : 'View'}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageShell>
  );
}
