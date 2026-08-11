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
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().optional(),
  unit_price: z.coerce.number().min(0, 'Cannot be negative'),
  reorder_level: z.coerce.number().int().min(0, 'Cannot be negative'),
  lead_time: z.coerce.number().int().min(0, 'Cannot be negative'),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']),
});

type Option = { value: string; label: string };

export type ProductValues = {
  id?: string;
  name?: string;
  description?: string;
  sku?: string;
  unit_price?: number;
  reorder_level?: number;
  lead_time?: number;
  category?: string;
  supplier?: string;
  status?: string;
};

export default function ProductModal({
  product,
  categories,
  suppliers,
}: {
  product?: ProductValues;
  categories: Option[];
  suppliers: Option[];
}) {
  const editing = Boolean(product?.id);

  const fields: FieldSpec[] = [
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      placeholder: 'Macbook Pro 13',
    },
    {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      placeholder: 'MBP-13',
      description: 'Optional, but unique within your company.',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'A laptop computer',
      full: true,
    },
    {
      name: 'unit_price',
      label: 'Unit Price',
      type: 'number',
      placeholder: '1000',
    },
    {
      name: 'reorder_level',
      label: 'Reorder Level',
      type: 'number',
      placeholder: '10',
      description: 'Low stock at or below this quantity.',
    },
    {
      name: 'lead_time',
      label: 'Lead Time',
      type: 'number',
      placeholder: '3',
      description: 'Days it takes to restock.',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      name: 'category_id',
      label: 'Category',
      type: 'combobox',
      placeholder: 'Select a category',
      options: [{ value: NONE, label: 'Uncategorized' }, ...categories],
      description: categories.length
        ? undefined
        : 'None yet. Add them under Categories.',
    },
    {
      name: 'supplier_id',
      label: 'Supplier',
      type: 'combobox',
      placeholder: 'Select a supplier',
      options: [{ value: NONE, label: 'None' }, ...suppliers],
    },
  ];

  return (
    <EntityFormModal
      title={editing ? 'Edit Product' : 'Add Product'}
      description={editing ? undefined : 'Add a new product to your catalogue.'}
      trigger={
        editing ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Product
            </span>
          </Button>
        )
      }
      schema={schema}
      fields={fields}
      defaultValues={{
        name: product?.name ?? '',
        description: product?.description ?? '',
        sku: product?.sku ?? '',
        unit_price: product?.unit_price ?? 0,
        reorder_level: product?.reorder_level ?? 0,
        lead_time: product?.lead_time ?? 0,
        // Records store the relations as `category`/`supplier`; the form binds
        // to `category_id`/`supplier_id`, which is what the API expects.
        category_id: product?.category || NONE,
        supplier_id: product?.supplier || NONE,
        status: product?.status || 'active',
      }}
      submitTo={
        editing ? `/api/products/${product!.id}` : '/api/products/create'
      }
      method={editing ? 'PUT' : 'POST'}
      submitLabel={editing ? 'Save changes' : 'Add Product'}
      successMessage={editing ? 'Product updated' : 'Product added'}
    />
  );
}
