'use client';
import { PlusCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import EntityFormModal, {
  NONE,
  type FieldSpec,
} from '@/components/EntityFormModal';

const schema = z.object({
  product: z.string().min(1, 'Pick a product'),
  quantity: z.coerce.number().int().positive('Must be at least 1'),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
});

type ProductOption = {
  value: string;
  label: string;
  price: number;
  hint?: string;
};

export type SalesItemValues = {
  id?: string;
  product?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
};

export default function SalesItemModal({
  orderId,
  item,
  products,
}: {
  orderId: string;
  item?: SalesItemValues;
  products: ProductOption[];
}) {
  const editing = Boolean(item?.id);

  const fields: FieldSpec[] = [
    {
      name: 'product',
      label: 'Product',
      type: 'combobox',
      placeholder: 'Select a product',
      options: products.map(({ value, label, hint }) => ({
        value,
        label,
        hint,
      })),
      emptyText: 'No product matches that.',
      full: true,
    },
    { name: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
    {
      name: 'unitPrice',
      label: 'Unit Price',
      type: 'number',
      placeholder: '0',
      description: 'Defaults to the product price; override for this sale.',
    },
    {
      name: 'discount',
      label: 'Line Discount',
      type: 'number',
      placeholder: '0',
      description: 'Amount off this line, not a percentage.',
    },
  ];

  return (
    <EntityFormModal
      title={editing ? 'Edit Line Item' : 'Add Line Item'}
      description={editing ? undefined : 'What is being sold, and for how much.'}
      trigger={
        editing ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button size="sm" className="h-8 gap-1" disabled={!products.length}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Item
            </span>
          </Button>
        )
      }
      schema={schema}
      fields={fields}
      defaultValues={{
        product: item?.product || NONE,
        quantity: item?.quantity ?? 1,
        unitPrice: item?.unitPrice ?? 0,
        discount: item?.discount ?? 0,
      }}
      submitTo={
        editing
          ? `/api/sales/${orderId}/items/${item!.id}`
          : `/api/sales/${orderId}/items`
      }
      method={editing ? 'PUT' : 'POST'}
      submitLabel={editing ? 'Save changes' : 'Add Item'}
      successMessage={editing ? 'Line item updated' : 'Line item added'}
    />
  );
}
