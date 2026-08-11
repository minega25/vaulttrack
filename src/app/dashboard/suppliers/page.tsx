import { listSuppliers } from '@/db';
import DeleteAction from '@/components/DeleteAction';
import PageShell from '@/components/PageShell';
import ResourceActions from '@/components/ResourceActions';
import SupplierModal from '@/components/SupplierModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();

  return (
    <PageShell
      crumb="Suppliers"
      title="Suppliers"
      description="Businesses you buy stock from."
      action={<SupplierModal />}
    >
      {suppliers.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No suppliers yet. Add one to attach it to your products.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">Lead Time</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {supplier.contactName || '--'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {supplier.email || '--'}
                </TableCell>
                <TableCell>{supplier.phone || '--'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : '--'}
                </TableCell>
                <TableCell>
                  <ResourceActions>
                    <SupplierModal supplier={supplier} />
                    <DeleteAction
                      endpoint={`/api/suppliers/${supplier.id}`}
                      label="supplier"
                      subject={supplier.name}
                    />
                  </ResourceActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </PageShell>
  );
}
