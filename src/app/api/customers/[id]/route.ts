import { NextResponse } from 'next/server';
import { deleteCustomer, updateCustomer } from '@/db';
import { apiError } from '@/lib/api';

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  try {
    return NextResponse.json(
      await updateCustomer(params.id, await request.json())
    );
  } catch (err) {
    return apiError(err, 'Failed to update customer');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await deleteCustomer(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, 'Failed to delete customer');
  }
}
