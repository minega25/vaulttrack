import Link from 'next/link';
import { listCategories, listProducts, listSuppliers } from '@/db';
import PageShell from '@/components/PageShell';
import ProductActionButtons from '@/components/ProductActionButtons';
import ProductModal from '@/components/ProductModal';
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

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

export default async function Products({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = TABS.some((t) => t.value === searchParams.status)
    ? searchParams.status!
    : 'all';

  const [products, categories, suppliers] = await Promise.all([
    listProducts(status),
    listCategories(),
    listSuppliers(),
  ]);

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name as string,
  }));
  const supplierOptions = suppliers.map((s) => ({
    value: s.id,
    label: s.name as string,
  }));

  return (
    <PageShell
      crumb="Products"
      title="Products"
      description="Manage your catalogue and restocking thresholds."
      action={
        <ProductModal
          categories={categoryOptions}
          suppliers={supplierOptions}
        />
      }
    >
      {/* Filtering happens server-side via the query string, so these stay
          shareable links rather than client-only state. */}
      <div className="mb-4 flex gap-1">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === 'all'
                ? '/dashboard/products'
                : `/dashboard/products?status=${tab.value}`
            }
            className={
              status === tab.value
                ? 'rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground'
                : 'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground'
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {status === 'all'
            ? 'No products yet. Add your first one to get started.'
            : `No ${status} products.`}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">SKU</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Reorder At
              </TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Lead Time
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.sku || '--'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">
                    {product.expand?.category?.name ?? 'Uncategorized'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {Number(product.unit_price ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
                  {Number(product.reorder_level ?? 0)}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums md:table-cell">
                  {Number(product.lead_time ?? 0)}d
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === 'active' ? 'outline' : 'secondary'
                    }
                  >
                    {product.status || 'active'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ProductActionButtons
                    product={{
                      id: product.id,
                      name: product.name as string,
                      description: product.description as string,
                      sku: product.sku as string,
                      unit_price: Number(product.unit_price ?? 0),
                      reorder_level: Number(product.reorder_level ?? 0),
                      lead_time: Number(product.lead_time ?? 0),
                      category: product.category as string,
                      supplier: product.supplier as string,
                      status: product.status as string,
                    }}
                    categories={categoryOptions}
                    suppliers={supplierOptions}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageShell>
  );
}
