import { categoryUsage, listCategories } from '@/db';
import CategoryModal from '@/components/CategoryModal';
import DeleteAction from '@/components/DeleteAction';
import PageShell from '@/components/PageShell';
import ResourceActions from '@/components/ResourceActions';
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

export default async function CategoriesPage() {
  const [categories, usage] = await Promise.all([
    listCategories(),
    categoryUsage(),
  ]);

  const options = categories.map((c) => ({
    value: c.id,
    label: c.name as string,
  }));

  return (
    <PageShell
      crumb="Categories"
      title="Product Categories"
      description="Group products so they are easier to find and filter."
      action={<CategoryModal categories={options} />}
    >
      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No categories yet. Add one, then pick it when creating a product.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const count = usage.get(category.id) ?? 0;
              return (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    {category.expand?.parent ? (
                      <Badge variant="outline">
                        {category.expand.parent.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Top level</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {category.description || '--'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {count}
                  </TableCell>
                  <TableCell>
                    <ResourceActions>
                      <CategoryModal
                        category={{
                          id: category.id,
                          name: category.name as string,
                          parent: category.parent as string,
                          description: category.description as string,
                        }}
                        categories={options}
                      />
                      <DeleteAction
                        endpoint={`/api/categories/${category.id}`}
                        label="category"
                        subject={category.name as string}
                        warning={
                          count > 0
                            ? `${count} product${
                                count === 1 ? '' : 's'
                              } will become uncategorized.`
                            : undefined
                        }
                      />
                    </ResourceActions>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </PageShell>
  );
}
