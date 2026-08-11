import DeleteAction from '@/components/DeleteAction';
import ProductModal, { type ProductValues } from '@/components/ProductModal';
import ResourceActions from '@/components/ResourceActions';

type Option = { value: string; label: string };

export default function ProductActionButtons({
  product,
  categories,
  suppliers,
}: {
  product: ProductValues & { id: string; name: string };
  categories: Option[];
  suppliers: Option[];
}) {
  return (
    <ResourceActions>
      <ProductModal
        product={product}
        categories={categories}
        suppliers={suppliers}
      />
      <DeleteAction
        endpoint={`/api/products/${product.id}`}
        label="product"
        subject={product.name}
      />
    </ResourceActions>
  );
}
