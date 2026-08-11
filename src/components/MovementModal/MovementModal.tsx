'use client';
import { PlusCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import EntityFormModal, { type FieldSpec } from '@/components/EntityFormModal';

const schema = z.object({
  product: z.string().min(1, 'Pick a product'),
  warehouse: z.string().min(1, 'Pick a warehouse'),
  type: z.enum(['in', 'out', 'adjustment', 'return']),
  quantity: z.coerce.number().int().refine((n) => n !== 0, 'Cannot be zero'),
  reference: z.string().optional(),
});

type Option = { value: string; label: string; hint?: string };

export default function MovementModal({
  products,
  warehouses,
}: {
  products: Option[];
  warehouses: Option[];
}) {
  const disabled = products.length === 0 || warehouses.length === 0;

  const fields: FieldSpec[] = [
    {
      name: 'product',
      label: 'Product',
      type: 'combobox',
      placeholder: 'Select a product',
      options: products,
      emptyText: 'No product matches that.',
    },
    {
      name: 'warehouse',
      label: 'Warehouse',
      type: 'select',
      placeholder: 'Select a warehouse',
      options: warehouses,
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      placeholder: 'Select a type',
      options: [
        { value: 'in', label: 'Stock in' },
        { value: 'out', label: 'Stock out' },
        { value: 'return', label: 'Return' },
        { value: 'adjustment', label: 'Adjustment' },
      ],
      description: 'In and returns add; out subtracts.',
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      placeholder: '10',
      description: 'Adjustments take a negative number to reduce stock.',
    },
    {
      name: 'reference',
      label: 'Reference',
      type: 'text',
      placeholder: 'PO-0001',
      description: 'Optional note tying this to a document.',
      full: true,
    },
  ];

  return (
    <EntityFormModal
      title="Record Movement"
      description="Adds a ledger entry and updates the stock level."
      trigger={
        <Button size="sm" className="h-8 gap-1" disabled={disabled}>
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Record Movement
          </span>
        </Button>
      }
      schema={schema}
      fields={fields}
      defaultValues={{
        product: '',
        warehouse: '',
        type: 'in',
        quantity: 0,
        reference: '',
      }}
      submitTo="/api/movements"
      method="POST"
      submitLabel="Record"
      successMessage="Movement recorded"
    />
  );
}
