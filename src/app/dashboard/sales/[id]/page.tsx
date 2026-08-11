import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import {
  getSalesOrder,
  isSalesOrderEditable,
  listCustomers,
  listProducts,
  listWarehouses,
  nextStatuses,
} from '@/db';
import DeleteAction from '@/components/DeleteAction';
import OrderActions from '@/components/OrderActions';
import ResourceActions from '@/components/ResourceActions';
import SalesItemModal from '@/components/SalesItemModal';
import SalesOrderModal from '@/components/SalesOrderModal';
import StatusBadge from '@/components/StatusBadge';
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

const money = (n: unknown) => Number(n ?? 0).toLocaleString();

export default async function SalesOrderPage({
  params,
}: {
  params: { id: string };
}) {
  let data;
  try {
    data = await getSalesOrder(params.id);
  } catch {
    notFound();
  }

  const { order, items } = data!;
  const [customers, warehouses, products] = await Promise.all([
    listCustomers(),
    listWarehouses(),
    listProducts(),
  ]);

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name as string,
  }));

  const editable = isSalesOrderEditable(order.status as string);
  const transitions = nextStatuses(order.status as string);

  const productOptions = products
    .map((p) => ({
      value: p.id,
      label: p.name as string,
      price: Number(p.unit_price ?? 0),
      hint: (p.sku as string) || undefined,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="flex w-full flex-col sm:gap-4 sm:py-4 sm:pl-60">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7">
            <Link href="/dashboard/sales">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back to sales</span>
            </Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            {order.orderNumber as string}
          </h1>
          <StatusBadge status={order.status as string} />
          <div className="ml-auto">
            <OrderActions
              orderId={order.id}
              status={order.status as string}
              transitions={transitions}
              canShip={editable}
            />
          </div>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="grid gap-1">
                <CardTitle>Line Items</CardTitle>
                <CardDescription>
                  {editable
                    ? 'What is being sold on this order.'
                    : 'Locked: stock has already moved for this order.'}
                </CardDescription>
              </div>
              {editable && (
                <SalesItemModal
                  orderId={order.id}
                  products={productOptions}
                />
              )}
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No items yet. Add one before shipping.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="hidden text-right md:table-cell">
                        Discount
                      </TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      {editable && (
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.expand?.product?.name ?? 'Unknown product'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Number(item.quantity ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {money(item.unitPrice)}
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums md:table-cell">
                          {money(item.discount)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {money(item.lineTotal)}
                        </TableCell>
                        {editable && (
                          <TableCell>
                            <ResourceActions>
                              <SalesItemModal
                                orderId={order.id}
                                products={productOptions}
                                item={{
                                  id: item.id,
                                  product: item.product as string,
                                  quantity: Number(item.quantity ?? 0),
                                  unitPrice: Number(item.unitPrice ?? 0),
                                  discount: Number(item.discount ?? 0),
                                }}
                              />
                              <DeleteAction
                                endpoint={`/api/sales/${order.id}/items/${item.id}`}
                                label="line item"
                                subject={
                                  item.expand?.product?.name ?? 'This line'
                                }
                              />
                            </ResourceActions>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:gap-8">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <CardTitle>Order</CardTitle>
                {editable && (
                  <ResourceActions>
                    <SalesOrderModal
                      order={{
                        id: order.id,
                        customer: order.customer as string,
                        warehouse: order.warehouse as string,
                        tax: Number(order.tax ?? 0),
                        shipping: Number(order.shipping ?? 0),
                        discount: Number(order.discount ?? 0),
                        notes: order.notes as string,
                      }}
                      customers={customerOptions}
                      warehouses={warehouses.map((w) => ({
                        value: w.id,
                        label: w.name as string,
                      }))}
                    />
                    <DeleteAction
                      endpoint={`/api/sales/${order.id}`}
                      label="order"
                      subject={order.orderNumber as string}
                      warning="Its line items go with it."
                    />
                  </ResourceActions>
                )}
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {order.expand?.customer?.name ?? 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ship from</span>
                  <span className="font-medium">
                    {order.expand?.warehouse?.name ?? 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ordered</span>
                  <span>
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString()
                      : '--'}
                  </span>
                </div>
                {order.shipDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipped</span>
                    <span>
                      {new Date(order.shipDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.notes ? (
                  <p className="border-t pt-3 text-muted-foreground">
                    {order.notes}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Totals</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{money(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="tabular-nums">{money(order.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="tabular-nums">{money(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="tabular-nums">
                    {Number(order.discount ?? 0) > 0 ? '-' : ''}
                    {money(order.discount)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{money(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
