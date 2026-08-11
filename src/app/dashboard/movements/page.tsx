import { listMovements, listProducts, listWarehouses } from '@/db';
import MovementModal from '@/components/MovementModal';
import PageShell from '@/components/PageShell';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

export default async function MovementsPage() {
  const [movements, products, warehouses] = await Promise.all([
    listMovements(),
    listProducts(),
    listWarehouses(),
  ]);

  const productOptions = products
    .map((p) => ({
      value: p.id,
      label: p.name as string,
      hint: (p.sku as string) || undefined,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <PageShell
      crumb="Movements"
      title="Stock Movements"
      description="Every change to stock, newest first."
      action={
        <MovementModal
          products={productOptions}
          warehouses={warehouses.map((w) => ({ value: w.id, label: w.name }))}
        />
      }
    >
      {movements.items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No movements recorded yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Warehouse</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="hidden md:table-cell">Reference</TableHead>
              <TableHead className="hidden md:table-cell">By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.items.map((movement) => {
              const quantity = Number(movement.quantity ?? 0);
              const user = movement.expand?.user;

              return (
                <TableRow key={movement.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(movement.created).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {movement.expand?.product?.name ?? 'Unknown product'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {movement.expand?.warehouse?.name ?? '--'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TYPE_LABELS[movement.type] ?? movement.type}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right tabular-nums',
                      quantity < 0 && 'text-destructive'
                    )}
                  >
                    {quantity > 0 ? '+' : ''}
                    {quantity}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {movement.reference || '--'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user ? [user.firstName, user.lastName].join(' ') : '--'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </PageShell>
  );
}
