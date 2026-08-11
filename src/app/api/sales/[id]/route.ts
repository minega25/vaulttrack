import { NextResponse } from 'next/server';
import {
  deleteSalesOrder,
  getSalesOrder,
  setSalesOrderStatus,
  updateSalesOrder,
} from '@/db';
import { apiError } from '@/lib/api';

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  try {
    return NextResponse.json(await getSalesOrder(params.id));
  } catch (err) {
    return apiError(err, 'Failed to load sales order');
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    return NextResponse.json(
      await updateSalesOrder(params.id, await request.json())
    );
  } catch (err) {
    return apiError(err, 'Failed to update sales order');
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { status } = await request.json();
    return NextResponse.json(await setSalesOrderStatus(params.id, status));
  } catch (err) {
    return apiError(err, 'Failed to change status');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await deleteSalesOrder(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, 'Failed to delete sales order');
  }
}
