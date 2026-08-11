import { NextResponse } from 'next/server';
import { createSalesOrder, listSalesOrders } from '@/db';
import { apiError } from '@/lib/api';

export async function GET() {
  try {
    return NextResponse.json(await listSalesOrders());
  } catch (err) {
    return apiError(err, 'Failed to load sales orders');
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createSalesOrder(await request.json()));
  } catch (err) {
    return apiError(err, 'Failed to create sales order');
  }
}
