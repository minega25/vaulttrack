import { NextResponse } from 'next/server';
import { deleteSupplier, updateSupplier } from '@/db';
import { apiError } from '@/lib/api';

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    return NextResponse.json(await updateSupplier(params.id, body));
  } catch (err) {
    return apiError(err, 'Failed to update supplier');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await deleteSupplier(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, 'Failed to delete supplier');
  }
}
