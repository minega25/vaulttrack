'use client';
import { PlusCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import EntityFormModal, { type FieldSpec } from '@/components/EntityFormModal';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]),
  phone: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
});

const fields: FieldSpec[] = [
  { name: 'name', label: 'Customer Name', type: 'text', placeholder: 'Acme Retail' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'buyer@acme.com' },
  { name: 'phone', label: 'Phone', type: 'text', placeholder: '+250 788 888 888' },
  {
    name: 'billingAddress',
    label: 'Billing Address',
    type: 'text',
    placeholder: 'KN 4 Ave',
  },
  {
    name: 'shippingAddress',
    label: 'Shipping Address',
    type: 'text',
    placeholder: 'Same as billing',
    full: true,
  },
];

export type CustomerValues = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
};

export default function CustomerModal({
  customer,
}: {
  customer?: CustomerValues;
}) {
  const editing = Boolean(customer?.id);

  return (
    <EntityFormModal
      title={editing ? 'Edit Customer' : 'Add Customer'}
      description={editing ? undefined : 'Someone you sell to.'}
      trigger={
        editing ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Customer
            </span>
          </Button>
        )
      }
      schema={schema}
      fields={fields}
      defaultValues={{
        name: customer?.name ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        billingAddress: customer?.billingAddress ?? '',
        shippingAddress: customer?.shippingAddress ?? '',
      }}
      submitTo={editing ? `/api/customers/${customer!.id}` : '/api/customers'}
      method={editing ? 'PUT' : 'POST'}
      submitLabel={editing ? 'Save changes' : 'Add Customer'}
      successMessage={editing ? 'Customer updated' : 'Customer added'}
    />
  );
}
