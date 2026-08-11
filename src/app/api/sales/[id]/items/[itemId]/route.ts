import { NextResponse } from 'next/server';
import { deleteSalesItem, updateSalesItem } from '@/db';
import { apiError } from '@/lib/api';

type Params = { params: { id: string; itemId: string } };

export async function PUT(request: Request, { params }: Params) {
  try {
    return NextResponse.json(
      await updateSalesItem(params.id, params.itemId, await request.json())
    );
  } catch (err) {
    return apiError(err, 'Failed to update line item');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await deleteSalesItem(params.id, params.itemId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, 'Failed to remove line item');
  }
}
