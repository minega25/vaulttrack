import { NextResponse } from 'next/server';
import { deleteProduct, getProduct, updateProduct } from '@/db';
import { apiError } from '@/lib/api';

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    const product = await getProduct(params.id);
    // The form binds to category_id/supplier_id; the record stores the
    // relations as category/supplier. Map them so editing pre-fills.
    return NextResponse.json({
      ...product,
      category_id: product.category ?? '',
      supplier_id: product.supplier ?? '',
    });
  } catch (err) {
    return apiError(err, 'Failed to load product');
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    const result = await updateProduct(params.id, body);
    return NextResponse.json(result);
  } catch (err) {
    return apiError(err, 'Failed to update product');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await deleteProduct(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, 'Failed to delete product');
  }
}
