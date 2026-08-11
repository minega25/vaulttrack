'use client';
import { PlusCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import EntityFormModal, { type FieldSpec } from '@/components/EntityFormModal';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const fields: FieldSpec[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Kigali Main',
    description: 'How this location appears throughout the app.',
  },
  {
    name: 'code',
    label: 'Code',
    type: 'text',
    placeholder: 'KGL',
    description: 'Short identifier, unique within your company.',
  },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    placeholder: 'KN 4 Ave',
    full: true,
  },
  { name: 'city', label: 'City', type: 'text', placeholder: 'Kigali' },
  { name: 'country', label: 'Country', type: 'text', placeholder: 'Rwanda' },
];

export type WarehouseValues = {
  id?: string;
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  country?: string;
};

export default function WarehouseModal({
  warehouse,
}: {
  warehouse?: WarehouseValues;
}) {
  const editing = Boolean(warehouse?.id);

  return (
    <EntityFormModal
      title={editing ? 'Edit Warehouse' : 'Add Warehouse'}
      description={
        editing ? undefined : 'Add a stocking location for your business.'
      }
      trigger={
        editing ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Warehouse
            </span>
          </Button>
        )
      }
      schema={schema}
      fields={fields}
      defaultValues={{
        name: warehouse?.name ?? '',
        code: warehouse?.code ?? '',
        address: warehouse?.address ?? '',
        city: warehouse?.city ?? '',
        country: warehouse?.country ?? '',
      }}
      submitTo={editing ? `/api/warehouses/${warehouse!.id}` : '/api/warehouses'}
      method={editing ? 'PUT' : 'POST'}
      submitLabel={editing ? 'Save changes' : 'Add Warehouse'}
      successMessage={editing ? 'Warehouse updated' : 'Warehouse added'}
    />
  );
}
