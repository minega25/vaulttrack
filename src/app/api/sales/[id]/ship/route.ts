import { NextResponse } from 'next/server';
import { shipSalesOrder } from '@/db';
import { apiError } from '@/lib/api';

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    return NextResponse.json(await shipSalesOrder(params.id));
  } catch (err) {
    return apiError(err, 'Failed to ship order');
  }
}
