import { listCustomers } from '@/db';
import CustomerModal from '@/components/CustomerModal';
import DeleteAction from '@/components/DeleteAction';
import PageShell from '@/components/PageShell';
import ResourceActions from '@/components/ResourceActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <PageShell
      crumb="Customers"
      title="Customers"
      description="The people and businesses you sell to."
      action={<CustomerModal />}
    >
      {customers.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No customers yet. Add one before raising a sales order.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">
                Shipping Address
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {customer.email || '--'}
                </TableCell>
                <TableCell>{customer.phone || '--'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {customer.shippingAddress || customer.billingAddress || '--'}
                </TableCell>
                <TableCell>
                  <ResourceActions>
                    <CustomerModal customer={customer} />
                    <DeleteAction
                      endpoint={`/api/customers/${customer.id}`}
                      label="customer"
                      subject={customer.name as string}
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
