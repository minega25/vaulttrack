import { listWarehouses } from '@/db';
import DeleteAction from '@/components/DeleteAction';
import PageShell from '@/components/PageShell';
import ResourceActions from '@/components/ResourceActions';
import WarehouseModal from '@/components/WarehouseModal';
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

export default async function WarehousesPage() {
  const warehouses = await listWarehouses();

  return (
    <PageShell
      crumb="Warehouses"
      title="Warehouses"
      description="Locations where you hold stock."
      action={<WarehouseModal />}
    >
      {warehouses.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No warehouses yet. Add one to start tracking stock by location.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="hidden md:table-cell">City</TableHead>
              <TableHead className="hidden md:table-cell">Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell className="font-medium">{warehouse.name}</TableCell>
                <TableCell>{warehouse.code || '--'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {warehouse.city || '--'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {warehouse.country || '--'}
                </TableCell>
                <TableCell>
                  <Badge variant={warehouse.isActive ? 'outline' : 'secondary'}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ResourceActions>
                    <WarehouseModal warehouse={warehouse} />
                    <DeleteAction
                      endpoint={`/api/warehouses/${warehouse.id}`}
                      label="warehouse"
                      subject={warehouse.name}
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
