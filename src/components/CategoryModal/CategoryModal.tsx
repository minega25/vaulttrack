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
  parent: z.string().optional(),
  description: z.string().optional(),
});

export type CategoryValues = {
  id?: string;
  name?: string;
  parent?: string;
  description?: string;
};

export default function CategoryModal({
  category,
  categories,
}: {
  category?: CategoryValues;
  /** All categories, used to offer a parent. */
  categories: { value: string; label: string }[];
}) {
  const editing = Boolean(category?.id);

  // Offering a category itself as its own parent would just be rejected, so
  // leave it out of the list.
  const parentOptions = categories.filter((c) => c.value !== category?.id);

  const fields: FieldSpec[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Laptops',
    },
    {
      name: 'parent',
      label: 'Parent Category',
      type: 'select',
      placeholder: 'None',
      options: [{ value: NONE, label: 'None (top level)' }, ...parentOptions],
      description: 'Optional, for nesting under a broader category.',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Portable computers',
      full: true,
    },
  ];

  return (
    <EntityFormModal
      title={editing ? 'Edit Category' : 'Add Category'}
      description={
        editing ? undefined : 'Group your products so they are easier to find.'
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
              Add Category
            </span>
          </Button>
        )
      }
      schema={schema}
      fields={fields}
      defaultValues={{
        name: category?.name ?? '',
        parent: category?.parent || NONE,
        description: category?.description ?? '',
      }}
      submitTo={editing ? `/api/categories/${category!.id}` : '/api/categories'}
      method={editing ? 'PUT' : 'POST'}
      submitLabel={editing ? 'Save changes' : 'Add Category'}
      successMessage={editing ? 'Category updated' : 'Category added'}
    />
  );
}
