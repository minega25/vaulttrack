'use client';
import { PlusCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import EntityFormModal, { type FieldSpec } from '@/components/EntityFormModal';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactName: z.string().optional(),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]),
  phone: z.string().optional(),
  leadTimeDays: z.coerce.number().int().min(0),
});

const fields: FieldSpec[] = [
  {
    name: 'name',
    label: 'Supplier Name',
    type: 'text',
    placeholder: 'Apple Distribution',
  },
  {
    name: 'contactName',
    label: 'Contact Person',
    type: 'text',
    placeholder: 'Jane Doe',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'orders@supplier.com',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: '+250 788 888 888',
  },
  {
    name: 'leadTimeDays',
    label: 'Lead Time (days)',
    type: 'number',
    placeholder: '7',
    description: 'Typical days between ordering and delivery.',
  },
];

export type SupplierValues = {
  id?: string;
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  leadTimeDays?: number;
};

export default function SupplierModal({
  supplier,
}: {
  supplier?: SupplierValues;
}) {
  const editing = Boolean(supplier?.id);

  return (
    <EntityFormModal
      title={editing ? 'Edit Supplier' : 'Add Supplier'}
      description={editing ? undefined : 'Add a business you buy stock from.'}
      trigger={
        editing ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Supplier
            </span>
          </Button>
        )
      }
      schema={schema}
      fields={fields}
      defaultValues={{
        name: supplier?.name ?? '',
        contactName: supplier?.contactName ?? '',
        email: supplier?.email ?? '',
        phone: supplier?.phone ?? '',
        leadTimeDays: supplier?.leadTimeDays ?? 0,
      }}
      submitTo={editing ? `/api/suppliers/${supplier!.id}` : '/api/suppliers'}
      method={editing ? 'PUT' : 'POST'}
      submitLabel={editing ? 'Save changes' : 'Add Supplier'}
      successMessage={editing ? 'Supplier updated' : 'Supplier added'}
    />
  );
}
