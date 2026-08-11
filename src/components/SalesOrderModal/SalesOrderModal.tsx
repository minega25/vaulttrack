'use client';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import EntityFormModal, {
  NONE,
  type FieldSpec,
} from '@/components/EntityFormModal';

const schema = z.object({
  customer: z.string().min(1, 'Pick a customer'),
  warehouse: z.string().min(1, 'Pick a warehouse'),
  tax: z.coerce.number().min(0),
  shipping: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  notes: z.string().optional(),
});

type Option = { value: string; label: string };

export type SalesOrderValues = {
  id?: string;
  customer?: string;
  warehouse?: string;
  tax?: number;
  shipping?: number;
  discount?: number;
  notes?: string;
};

export default function SalesOrderModal({
  order,
  customers,
  warehouses,
}: {
  order?: SalesOrderValues;
  customers: Option[];
  warehouses: Option[];
}) {
  const router = useRouter();
  const editing = Boolean(order?.id);
  const blocked = customers.length === 0 || warehouses.length === 0;

  const fields: FieldSpec[] = [
    {
      name: 'customer',
      label: 'Customer',
      type: 'combobox',
      placeholder: 'Select a customer',
      options: customers,
      description: customers.length ? undefined : 'Add a customer first.',
    },
    {
      name: 'warehouse',
      label: 'Ship From',
      type: 'select',
      placeholder: 'Select a warehouse',
      options: warehouses,
      description: 'Stock is deducted from here when the order ships.',
    },
    { name: 'tax', label: 'Tax', type: 'number', placeholder: '0' },
    { name: 'shipping', label: 'Shipping', type: 'number', placeholder: '0' },
    {
      name: 'discount',
      label: 'Order Discount',
      type: 'number',
      placeholder: '0',
      description: 'Taken off the whole order, after line discounts.',
    },
    { name: 'notes', label: 'Notes', type: 'text', placeholder: '', full: true },
  ];

  return (
    <EntityFormModal
      title={editing ? 'Edit Order' : 'New Sales Order'}
      description={
        editing
          ? undefined
          : 'Creates a draft. Add line items next, then ship it.'
      }
      trigger={
        editing ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button size="sm" className="h-8 gap-1" disabled={blocked}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              New Order
            </span>
          </Button>
        )
      }
      schema={schema}
      fields={fields}
      defaultValues={{
        customer: order?.customer || NONE,
        warehouse: order?.warehouse || NONE,
        tax: order?.tax ?? 0,
        shipping: order?.shipping ?? 0,
        discount: order?.discount ?? 0,
        notes: order?.notes ?? '',
      }}
      submitTo={editing ? `/api/sales/${order!.id}` : '/api/sales'}
      method={editing ? 'PUT' : 'POST'}
      submitLabel={editing ? 'Save changes' : 'Create Order'}
      successMessage={editing ? 'Order updated' : 'Order created'}
      onSuccess={(data) => {
        // Take the user straight to the new order so they can add lines.
        if (!editing && data?.id) router.push(`/dashboard/sales/${data.id}`);
      }}
    />
  );
}
