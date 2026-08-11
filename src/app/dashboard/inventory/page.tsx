import { listInventory, listProducts, listWarehouses } from '@/db';
import MovementModal from '@/components/MovementModal';
import PageShell from '@/components/PageShell';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const [inventory, products, warehouses] = await Promise.all([
    listInventory(),
    listProducts(),
    listWarehouses(),
  ]);

  const reorderLevels = new Map(
    products.map((p) => [p.id, Number(p.reorder_level ?? 0)])
  );

  const productOptions = products
    .map((p) => ({
      value: p.id,
      label: p.name as string,
      hint: (p.sku as string) || undefined,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <PageShell
      crumb="Inventory"
      title="Inventory"
      description="Stock on hand for each product, by location."
      action={
        <MovementModal
          products={productOptions}
          warehouses={warehouses.map((w) => ({ value: w.id, label: w.name }))}
        />
      }
    >
      {inventory.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nothing in stock yet. Record a movement to open a stock position.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead className="text-right">On Hand</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Reserved
              </TableHead>
              <TableHead className="hidden md:table-cell">Bin</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((row) => {
              const quantity = Number(row.quantity ?? 0);
              const reorderLevel = reorderLevels.get(row.product as string) ?? 0;
              const low = reorderLevel > 0 && quantity <= reorderLevel;

              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.expand?.product?.name ?? 'Unknown product'}
                  </TableCell>
                  <TableCell>
                    {row.expand?.warehouse?.name ?? 'Unknown warehouse'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {quantity}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    {Number(row.reserved ?? 0)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {row.binLocation || '--'}
                  </TableCell>
                  <TableCell>
                    {quantity < 0 ? (
                      <Badge variant="destructive">Negative</Badge>
                    ) : low ? (
                      <Badge variant="destructive">Low stock</Badge>
                    ) : (
                      <Badge variant="outline">OK</Badge>
                    )}
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
