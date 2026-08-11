import Link from 'next/link';
import {
  ArrowUpRight,
  Boxes,
  Coins,
  ReceiptText,
  TriangleAlert,
} from 'lucide-react';

import { currentUser, getDashboardStats } from '@/db';
import StatusBadge from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  in: 'Stock in',
  out: 'Stock out',
  adjustment: 'Adjustment',
  transfer: 'Transfer',
  return: 'Return',
};

export default async function Dashboard() {
  const [user, stats] = await Promise.all([
    Promise.resolve(currentUser()),
    getDashboardStats(),
  ]);

  const tiles = [
    {
      title: 'Stock Value',
      value: stats.stockValue.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      }),
      hint: 'On-hand quantity x unit price',
      Icon: Coins,
    },
    {
      title: 'Units On Hand',
      value: stats.totalUnits.toLocaleString(),
      hint: `Across ${stats.warehouseCount} warehouse${
        stats.warehouseCount === 1 ? '' : 's'
      }`,
      Icon: Boxes,
    },
    {
      title: 'Revenue',
      value: stats.revenue.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      }),
      hint: `${stats.openOrderCount} order${
        stats.openOrderCount === 1 ? '' : 's'
      } still open`,
      Icon: ReceiptText,
    },
    {
      title: 'Low Stock',
      value: stats.lowStock.length.toLocaleString(),
      hint: 'At or below reorder level',
      Icon: TriangleAlert,
    },
  ];

  return (
    <div className="flex w-full flex-col sm:gap-4 sm:py-4 sm:pl-60">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div>
          <h1 className="text-2xl font-semibold">
            {user ? `Welcome back, ${user.firstName}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is where your stock stands right now.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {tiles.map(({ title, value, hint, Icon }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{value}</div>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Movements</CardTitle>
                <CardDescription>
                  The latest changes to your stock.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/movements">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.recentMovements.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No movements recorded yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Warehouse
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentMovements.map((movement) => {
                      const quantity = Number(movement.quantity ?? 0);
                      return (
                        <TableRow key={movement.id}>
                          <TableCell className="font-medium">
                            {movement.expand?.product?.name ?? 'Unknown'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {movement.expand?.warehouse?.name ?? '--'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {TYPE_LABELS[movement.type] ?? movement.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {quantity > 0 ? '+' : ''}
                            {quantity}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Needs Reordering</CardTitle>
                <CardDescription>At or below reorder level.</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" className="ml-auto gap-1">
                <Link href="/dashboard/inventory">
                  Inventory
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              {stats.lowStock.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Everything is above its reorder level.
                </p>
              ) : (
                stats.lowStock.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reorder at {item.reorderLevel}
                      </p>
                    </div>
                    <div className="ml-auto font-medium tabular-nums">
                      {item.onHand}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Revenue counts orders once they ship.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="ml-auto gap-1">
              <Link href="/dashboard/sales">
                All Orders
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentSales.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sales orders yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentSales.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/sales/${order.id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {order.expand?.customer?.name ?? 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status as string} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {Number(order.total ?? 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
